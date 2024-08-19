from django.urls import path

from . import consumers
from . import views
from accounts.views import *
from django.contrib.auth.views import LoginView, LogoutView


urlpatterns = [
    path('', views.index, name="index"),
    # path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("ws/presence/", consumers.PresenceConsumer.as_asgi()),
]

