from django.urls import path
from .views import *

urlpatterns = [
    path('houses/', HouseView.as_view()),
    path('houselogs/', HouseLogView.as_view()),
    path('login/', LoginView.as_view()),
    path('user/', UserView.as_view()),
    path('tenant/', TenantView.as_view()),
]