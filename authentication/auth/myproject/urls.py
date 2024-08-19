from django.contrib import admin
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
from accounts import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    
    path("", include("presence.urls")),
]

urlpatterns += [
    path('api-auth/', include('rest_framework.urls')),
    path('oauth/login/', views.oauth_login, name='oauth_login'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)