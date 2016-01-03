import io
import logging

from pyramid.view import view_config
from pyramid.response import Response

import rpy2.rinterface
from rpy2.robjects import pandas2ri
pandas2ri.activate()

from . import models

logger = logging.getLogger(__name__)

MIMES = {"png": "image/png",
         "pdf": "application/pdf",
         "json": "application/json",
         "csv": "text/csv",
         "excel": 'application/vnd.ms-excel'}


def log_timer(wrapped):
    def wrapper(context, request):
        start = time.time()
        response = wrapped(context, request)
        duration = time.time() - start
        response.headers['X-View-Time'] = '%.3f' % (duration,)
        return response
    return wrapper

def cors_headers(wrapped):
    def wrapper(context, request):
        response = wrapped(context, request)
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Max-Age': '1728000'
        })
        return response
    return wrapper


def parse_bool(boolstr):
    if boolstr.lower() in {"yes", "y", "ok", "on", "true"}:
        return True
    return False


def get_params(request):
    """parse the request parameters"""
    params = {}

    # Expected parameters
    # sometimes strings are empty
    logger.info(request.matchdict)
    params["startyear"] = int(request.params.get("startyear", 1906) or 1906)
    params["endyear"] = int(request.params.get("endyear", 2012) or 2012)
    params["station"] = str(request.matchdict.get("station"))

    # Use model for now
    params["model"] = str(request.params.get("model", "linear"))

    params["polynomial"] = int(request.params.get("polynomial", 1) or 1)
    params["wind"] = int(parse_bool(request.params.get("wind", "")))
    params["nodal"] = int(parse_bool(request.params.get("nodal", "")))

    params["polynomial_loess"] = int(request.params.get("polynomial_loess", 1)
                                     or 1)
    params["span"] = float(request.params.get("span", 1) or 1)

    params["gia"] = int(parse_bool(request.params.get("gia", "")))
    params["ib"] = int(parse_bool(request.params.get("ib", "")))

    params["format"] = str(request.params.get("format", "json"))
    return params



@view_config(route_name='stations', renderer='json', decorator=cors_headers)
def make_stations(request):
    """return annual means as data"""
    # parameters
    params = get_params(request)
    return []

@view_config(route_name='station', renderer='jsonnan', decorator=cors_headers)
def make_station(request):
    """return annual means as data"""
    # parameters
    params = get_params(request)
    if params.get('station') is None:
        raise ValueError('No station found in request')

    code = models.fill_r_template("model.mak", **params)
    df, summary = models.run_r_model(code)

    mime = MIMES[params.get('format', 'json')]
    data = {
        'records': df.to_dict(orient='records')
    }
    return data
