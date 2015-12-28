from pyramid.static import static_view

static_view = static_view('../site/dist', use_subpath=True)
