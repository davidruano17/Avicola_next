from django.db import models

class Rol(models.Model):
    rol_id = models.AutoField(primary_key=True)
    rol_nombre = models.CharField(max_length=50)
    rol_estado = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = 'roles'

    def __str__(self):
        return self.rol_nombre


class Usuario(models.Model):
    class TipoDoc(models.TextChoices):
        CC = 'CC', 'CC'
        TI = 'TI', 'TI'
        CE = 'CE', 'CE'
        PPT = 'PPT', 'PPT'
        PASAPORTE = 'PASAPORTE', 'PASAPORTE'

    class Estado(models.TextChoices):
        ACTIVO = 'Activo', 'Activo'
        INACTIVO = 'Inactivo', 'Inactivo'

    usuario_id = models.AutoField(primary_key=True)
    usu_nombre_completo = models.CharField(max_length=45)
    usu_correo_electronico = models.CharField(max_length=100)
    usu_numero_celular = models.CharField(max_length=15)
    usu_tipo_doc_identificacion = models.CharField(max_length=9, choices=TipoDoc.choices)
    usu_No_doc_identificacion = models.CharField(max_length=11, unique=True, db_column='usu_No_doc_identificacion')
    usu_residencia = models.CharField(max_length=45)
    usu_fecha_ingreso = models.DateField()
    usu_password = models.CharField(max_length=255)
    usu_estado = models.CharField(max_length=8, choices=Estado.choices, default=Estado.ACTIVO)
    rol = models.ForeignKey(Rol, on_delete=models.RESTRICT, db_column='rol_id', related_name='usuarios')

    class Meta:
        managed = False
        db_table = 'usuarios'

    def __str__(self):
        return f"{self.usu_nombre_completo} ({self.usu_No_doc_identificacion})"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return self.usu_estado == self.Estado.ACTIVO

    @property
    def is_anonymous(self):
        return False

    @property
    def es_administrador(self):
        if not self.rol:
            return False
        nombre_rol = self.rol.rol_nombre.lower()
        return self.rol_id == 1 or 'lider' in nombre_rol or 'líder' in nombre_rol or 'admin' in nombre_rol

    @property
    def es_instructor(self):
        if not self.rol:
            return False
        nombre_rol = self.rol.rol_nombre.lower()
        return self.es_administrador or 'investigador' in nombre_rol or 'instructor' in nombre_rol
