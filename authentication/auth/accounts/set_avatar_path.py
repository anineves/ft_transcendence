import os


def set_avatar_path(path):
    if path == None:
        return None
    scheme = 'https'
    host = os.getenv('MAIN_HOST', 0)
    port = '8443'
    absolute_url = f"{scheme}://{host}:{port}{path}"
    
    return absolute_url