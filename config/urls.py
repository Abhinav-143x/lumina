from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.core.urls")),
    path("api/v1/notes/", include("apps.notes.urls")),
    path("api/v1/habits/", include("apps.habits.urls")),
    path("api/v1/calendar/", include("apps.calendar_app.urls")),
    path("api/v1/ai/", include("apps.ai_assistant.urls")),
    path("api/v1/reminders/", include("apps.reminders.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
