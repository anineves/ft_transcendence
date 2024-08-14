from django.urls import path, include
from .views import *
from rest_framework_simplejwt import views as jwt_views
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'register', UserRegister, basename='userregister')

urlpatterns = [
    path('', include(router.urls)),

    path('users/', UserList.as_view(), name='user_list'),
    path('user/<int:pk>', UserDetail.as_view(), name='user_detail'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    path('players/', PlayerList.as_view(), name='player_list'),
    path('player/<int:pk>', PlayerDetail.as_view(), name='player_detail'),

    path('player/requests/', FriendRequestList.as_view(), name='requests'),
    path('player/send_friend_request/<str:nickname>/', SendFriendRequest.as_view(), name='send_request'),

    path('player/respond_friend_request/<int:pk>/', RespondFriendRequest.as_view(), name='respond_requests'),
]

