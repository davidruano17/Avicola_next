from django.contrib.auth.hashers import make_password
from datetime import date
from .models import Usuario, Rol

def get_or_create_demo_users():
    """
    Garantiza que existan los roles y los usuarios base (admin, aprendiz, investigador)
    en caso de pruebas o inicialización.
    """
    rol_admin, _ = Rol.objects.get_or_create(
        rol_nombre='Instructor lider',
        defaults={'rol_estado': 1}
    )
    rol_aprendiz, _ = Rol.objects.get_or_create(
        rol_nombre='Aprendiz de contrato',
        defaults={'rol_estado': 1}
    )
    rol_investigador, _ = Rol.objects.get_or_create(
        rol_nombre='Instructor investigador',
        defaults={'rol_estado': 1}
    )

    demo_dict = {}

    admin_user = Usuario.objects.filter(usu_correo_electronico__iexact='admin@avisena.com').first()
    if not admin_user:
        admin_user = Usuario.objects.filter(usu_No_doc_identificacion='1000000001').first()
    if not admin_user:
        admin_user = Usuario.objects.create(
            usu_nombre_completo='Instructor Líder (Admin)',
            usu_correo_electronico='admin@avisena.com',
            usu_numero_celular='3001234567',
            usu_tipo_doc_identificacion='CC',
            usu_No_doc_identificacion='1000000001',
            usu_residencia='Granja Centro Agropecuario',
            usu_fecha_ingreso=date.today(),
            usu_password=make_password('admin123'),
            usu_estado=Usuario.Estado.ACTIVO,
            rol=rol_admin
        )
    demo_dict['admin'] = admin_user

    aprendiz_user = Usuario.objects.filter(usu_correo_electronico__iexact='aprendiz@avisena.com').first()
    if not aprendiz_user:
        aprendiz_user = Usuario.objects.filter(usu_No_doc_identificacion='1000000002').first()
    if not aprendiz_user:
        aprendiz_user = Usuario.objects.create(
            usu_nombre_completo='Aprendiz SENA',
            usu_correo_electronico='aprendiz@avisena.com',
            usu_numero_celular='3009876543',
            usu_tipo_doc_identificacion='CC',
            usu_No_doc_identificacion='1000000002',
            usu_residencia='Granja Centro Agropecuario',
            usu_fecha_ingreso=date.today(),
            usu_password=make_password('aprendiz123'),
            usu_estado=Usuario.Estado.ACTIVO,
            rol=rol_aprendiz
        )
    demo_dict['aprendiz'] = aprendiz_user

    investigador_user = Usuario.objects.filter(usu_correo_electronico__iexact='investigador@avisena.com').first()
    if not investigador_user:
        investigador_user = Usuario.objects.filter(usu_No_doc_identificacion='1000000003').first()
    if not investigador_user:
        investigador_user = Usuario.objects.create(
            usu_nombre_completo='Instructor Investigador',
            usu_correo_electronico='investigador@avisena.com',
            usu_numero_celular='3005557788',
            usu_tipo_doc_identificacion='CC',
            usu_No_doc_identificacion='1000000003',
            usu_residencia='Granja Centro Agropecuario',
            usu_fecha_ingreso=date.today(),
            usu_password=make_password('investigador123'),
            usu_estado=Usuario.Estado.ACTIVO,
            rol=rol_investigador
        )
    demo_dict['investigador'] = investigador_user

    return demo_dict


def get_request_user(request):
    """
    Retorna el usuario autenticado desde el request o un usuario por defecto
    activo de la base de datos si se está en desarrollo/pruebas.
    """
    if request and hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
        if isinstance(request.user, Usuario):
            return request.user

    user = Usuario.objects.filter(usu_estado=Usuario.Estado.ACTIVO).first()
    if user:
        return user

    demos = get_or_create_demo_users()
    return demos.get('admin')
