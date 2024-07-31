from django.contrib import admin
# from accounts import urls
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from accounts.views import UserRegister, UserLogin
from rest_framework_simplejwt import views as jwt_views

# router = DefaultRouter()
# router.register(r'register', UserRegister, basename='userregister')
# router.register(r'login', UserLogin, basename='userlogin')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
]


