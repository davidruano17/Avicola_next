from django.db import models

class ProduccionHuevos(models.Model):
    class Jornada(models.TextChoices):
        MANANA = 'Mañana', 'Mañana'
        MEDIO_DIA = 'Medio día', 'Medio día'
        TARDE = 'Tarde', 'Tarde'

    produccion_id = models.AutoField(primary_key=True)
    prod_fecha_recoleccion = models.DateField()
    prod_hora_recoleccion = models.TimeField()
    prod_semana_de_produccion = models.IntegerField()
    prod_jornada_recoleccion = models.CharField(max_length=30, choices=Jornada.choices)
    prod_huevos_buenos = models.IntegerField(default=0)
    prod_huevos_rotos = models.IntegerField(default=0)
    prod_huevos_descarte = models.IntegerField(default=0)
    prod_observaciones = models.CharField(max_length=300, null=True, blank=True)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='producciones')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='producciones')

    class Meta:
        managed = False
        db_table = 'produccionhuevos'

    def __str__(self):
        return f"Producción #{self.produccion_id} ({self.prod_fecha_recoleccion})"


class ClasificacionHuevos(models.Model):
    clasificacion_id = models.AutoField(primary_key=True)
    clas_fecha_clasificacion = models.DateField()
    clas_huevo_tipo_A = models.IntegerField(default=0, db_column='clas_huevo_tipo_A')
    clas_huevo_tipo_AA = models.IntegerField(default=0, db_column='clas_huevo_tipo_AA')
    clas_huevo_tipo_AAA = models.IntegerField(default=0, db_column='clas_huevo_tipo_AAA')
    clas_huevo_tipo_B = models.IntegerField(default=0, db_column='clas_huevo_tipo_B')
    clas_huevo_tipo_C = models.IntegerField(default=0, db_column='clas_huevo_tipo_C')
    clas_huevo_tipo_Jumbo = models.IntegerField(default=0, db_column='clas_huevo_tipo_Jumbo')
    clas_observaciones = models.CharField(max_length=300, null=True, blank=True)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='clasificaciones')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='clasificaciones')
    produccion = models.OneToOneField('produccion.ProduccionHuevos', on_delete=models.SET_NULL, db_column='produccion_id', related_name='clasificacion', null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'clasificacionhuevos'

    def __str__(self):
        return f"Clasificación #{self.clasificacion_id} (Producción #{self.produccion_id})"


class AlimentacionAves(models.Model):
    alimentacion_id = models.AutoField(primary_key=True)
    alim_cant_alimento = models.DecimalField(max_digits=10, decimal_places=2)
    alim_fecha = models.DateField()
    alim_tipo_alimento = models.CharField(max_length=45)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='alimentaciones')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='alimentaciones')

    # Django crea este atributo automáticamente para la FK `galpon`; se declara solo para el analizador de tipos.
    galpon_id: int

    class Meta:
        managed = False
        db_table = 'alimentacionaves'

    def __str__(self):
        return f"Alimentación #{self.alimentacion_id} - Galpón {self.galpon_id}" 
