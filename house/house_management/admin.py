from django.contrib import admin
from django.apps import apps
from django.db.models import DateField, DateTimeField


class AutoModelAdmin(admin.ModelAdmin):

    def __init__(self, model, admin_site):
        self.model = model
        meta = model._meta

        # ✅ Primary Key (dynamic)
        pk = meta.pk.name

        # ✅ list_display (PK + first 4 fields)
        fields = [f.name for f in meta.fields if f.name != pk]
        self.list_display = [pk] + fields[:4]

        # ✅ search_fields (only safe text-like fields)
        self.search_fields = [
            f.name for f in meta.fields
            if f.get_internal_type() in ['CharField', 'TextField', 'EmailField']
        ]

        # ✅ list_filter (relations + choices fields)
        self.list_filter = [
            f.name for f in meta.fields
            if f.is_relation or f.choices
        ]

        # ✅ date_hierarchy (ONLY DateField / DateTimeField)
        date_field = next(
            (f.name for f in meta.fields if isinstance(f, (DateField, DateTimeField))),
            None
        )
        if date_field:
            self.date_hierarchy = date_field

        # ✅ readonly primary key
        self.readonly_fields = [pk]

        # ✅ ordering (if exists)
        if hasattr(meta, 'ordering') and meta.ordering:
            self.ordering = meta.ordering

        super().__init__(model, admin_site)


# ❌ Skip problematic Django apps
EXCLUDE_APPS = [
    'admin',
    'auth',
    'contenttypes',
    'sessions',
]


# ✅ Auto register all models
for app_config in apps.get_app_configs():
    if app_config.label in EXCLUDE_APPS:
        continue

    for model in app_config.get_models():
        try:
            admin.site.register(model, AutoModelAdmin)
        except admin.sites.AlreadyRegistered:
            pass