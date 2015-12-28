"""
Models for sea level package
"""

import pyramid.renderers
from rpy2.robjects import r
from rpy2.robjects import pandas2ri
from rpy2.robjects import numpy2ri
from rpy2.robjects import conversion



def annual_means(station="DEN HELDER"):
    data = pandas2ri.load_data('dutch', 'sealevel')
    stationdf = filter(lambda x:x['name'] ==station, data.values())[0]['data']
    return stationdf


def fill_r_template(name, **values):
    """fill in the R template"""
    code = pyramid.renderers.render(name, values)
    return code


def run_r_model(code):
    """apply the model in the code and return the df and fit object"""
    objects = r(code)
    df, summary = objects
    pandas2ri.activate()
    df = pandas2ri.ri2py(df)
    pandas2ri.deactivate()
    summary = conversion.ri2py(summary)

    return df, summary
