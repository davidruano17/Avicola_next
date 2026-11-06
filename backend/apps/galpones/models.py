from django.db import models

class Galpon(models.Model):
    galpon_id = models.AutoField(primary_key=True)
    galp_fecha_ingreso = models.DateField()
    galp_hora_ingreso = models.TimeField()
    galp_peso_promedio = models.DecimalField(max_digits=5, decimal_places=2)
    galp_numero_aves = models.IntegerField()
    galp_numero_aves_inicial = models.IntegerField(null=True, blank=True)
    galp_semana_de_vida = models.IntegerField()
    galp_linea_de_aves = models.CharField(max_length=45)
    galp_responsable = models.CharField(max_length=100, null=True, blank=True)
    galp_certificados = models.CharField(max_length=255, null=True, blank=True)
    galp_observaciones = models.CharField(max_length=300, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'galpones'

    def __str__(self):
        return f"Galpón #{self.galpon_id} - {self.galp_linea_de_aves}"
