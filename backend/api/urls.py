from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.views.decorators.csrf import csrf_exempt

router = DefaultRouter()
router.register(r'files', views.UploadedFileViewSet, basename='files')
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'addresses', views.AddressViewSet, basename='addresses')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', csrf_exempt(views.RegisterView.as_view()), name='register'),
    path('login/', csrf_exempt(views.login_view), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('users/me/', views.UserViewSet.as_view({'get': 'me', 'patch': 'update_me', 'put': 'update_me'}), name='user-me'),
] 