from django.db import models

class Notificacion(models.Model):
    class Tipo(models.TextChoices):
        MORTALIDAD = 'Mortalidad', 'Mortalidad'
        SALUD = 'Salud', 'Salud'
        INVENTARIO = 'Inventario', 'Inventario'
        FINANZAS = 'Finanzas', 'Finanzas'
        SISTEMA = 'Sistema', 'Sistema'

    notificacion_id = models.AutoField(primary_key=True)
    noti_titulo = models.CharField(max_length=100)
    noti_mensaje = models.CharField(max_length=255)
    noti_tipo = models.CharField(max_length=10, choices=Tipo.choices)
    noti_estado_leido = models.IntegerField(default=0)
    noti_fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='noti_fecha_creacion')
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.SET_NULL, null=True, blank=True, db_column='galpon_id', related_name='notificaciones')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE, db_column='usuario_id', related_name='notificaciones')

    class Meta:
        managed = False
        db_table = 'notificaciones'

    def __str__(self):
        return f"[{self.noti_tipo}] {self.noti_titulo}"
