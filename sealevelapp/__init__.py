import math
import logging

from pyramid.config import Configurator
from pyramid.renderers import JSON

import simplejson

jsonnan = JSON(serializer=simplejson.dumps, indent=4, ignore_nan=True)

# def handle_nan(obj, request):
#     logging.warning('adapting %s', obj)
#     if isinstance(obj, float) and np.isnan(obj):
#         return "null"
#     return obj
# jsonnan.add_adapter(float, handle_nan)

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_mako')
    config.include('pyramid_chameleon')
    config.include('pyramid_beaker')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('stations', '/stations')
    config.add_route('station', '/stations/{station}')
    config.scan()

    config.add_renderer('jsonnan', jsonnan)

    # rest is static
    config.add_route('catchall_static', '/*subpath')
    config.add_view('sealevelapp.static.static_view', route_name='catchall_static')
    return config.make_wsgi_app()
