from django.urls import path

from . import consumers
from . import views
from accounts.views import *
from django.contrib.auth.views import LoginView, LogoutView


urlpatterns = [
    path('', views.index, name="index"),
    path('test/', views.test, name="test"),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

