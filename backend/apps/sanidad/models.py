from django.db import models

class MortalidadAves(models.Model):
    mortalidad_id = models.AutoField(primary_key=True)
    mort_fecha = models.DateField()
    mort_cantidad_aves = models.IntegerField()
    mort_edad_semanas = models.IntegerField(default=1, null=True, blank=True)
    mort_causa_muerte = models.CharField(max_length=100)
    mort_resultado_necropsia = models.CharField(max_length=300, null=True, blank=True)
    mort_disposicion_final = models.CharField(max_length=300)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='mortalidades')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='mortalidades')

    class Meta:
        managed = False
        db_table = 'mortalidadaves'

    def __str__(self):
        return f"Mortalidad #{self.mortalidad_id} ({self.mort_cantidad_aves} aves - {self.mort_causa_muerte})"


class MorbilidadAves(models.Model):
    class GradoAfectacion(models.TextChoices):
        LEVE = 'Leve', 'Leve'
        MODERADO = 'Moderado', 'Moderado'
        CRITICO = 'Critico', 'Critico'

    morbilidad_id = models.AutoField(primary_key=True)
    morb_fecha_reporte = models.DateField()
    morb_grado_afectacion = models.CharField(max_length=10, choices=GradoAfectacion.choices)
    morb_cant_aves_afectadas = models.IntegerField()
    morb_sintomas = models.CharField(max_length=255)
    morb_concepto_veterinario = models.CharField(max_length=255, null=True, blank=True)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='morbilidades')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='morbilidades')

    class Meta:
        managed = False
        db_table = 'morbilidadaves'

    def __str__(self):
        return f"Morbilidad #{self.morbilidad_id} ({self.morb_grado_afectacion})"


class TratamientoAves(models.Model):
    tratamiento_id = models.AutoField(primary_key=True)
    trat_fecha_tratamiento = models.DateField()
    trat_diagnostico = models.CharField(max_length=300)
    trat_tratamiento = models.CharField(max_length=50)
    trat_tipo_tratamiento = models.CharField(max_length=50)
    trat_via_administracion = models.CharField(max_length=50)
    trat_dosis_suministro = models.CharField(max_length=20)
    trat_duracion_tratamiento = models.IntegerField()
    trat_medico_veterinario = models.CharField(max_length=45)
    trat_operario_encargado = models.CharField(max_length=45)
    trat_observaciones = models.CharField(max_length=100, null=True, blank=True)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='tratamientos')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='tratamientos')
    morbilidad = models.ForeignKey('sanidad.MorbilidadAves', on_delete=models.RESTRICT, db_column='morbilidad_id', related_name='tratamientos', null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'tratamiento_aves'

    def __str__(self):
        return f"Tratamiento #{self.tratamiento_id} - {self.trat_tratamiento}"
