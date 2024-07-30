from django.urls import path, include
from .views import *
from rest_framework_simplejwt import views as jwt_views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'register', UserRegister, basename='userregister')
router.register(r'login', UserLogin, basename='userlogin')

urlpatterns = [
    path('', include(router.urls)),

    path('users/', UserList.as_view(), name='user_list'),
    path('user/<int:pk>', UserDetail.as_view(), name='user_detail'),
    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    path('players/', PlayerList.as_view(), name='player_list'),
    path('player/<int:pk>', PlayerDetail.as_view(), name='player_detail'),
    path('update-profile/', UserUpdate.as_view(), name='update-profile'),

]
