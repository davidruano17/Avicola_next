from django.db import models

class FinanzasUdAvicola(models.Model):
    class TipoOperacion(models.TextChoices):
        INGRESO = 'Ingreso', 'Ingreso'
        GASTO = 'Gasto', 'Gasto'

    class CategoriaGasto(models.TextChoices):
        ALIMENTO = 'Alimento', 'Alimento'
        MEDICINA = 'Medicina', 'Medicina'
        MANTENIMIENTO = 'Mantenimiento', 'Mantenimiento'
        INSUMOS = 'Insumos', 'Insumos'
        VENTAS = 'Ventas', 'Ventas'
        OTRO = 'Otro', 'Otro'

    class ClasificacionPanal(models.TextChoices):
        A = 'A', 'A'
        AA = 'AA', 'AA'
        AAA = 'AAA', 'AAA'
        B = 'B', 'B'
        C = 'C', 'C'
        JUMBO = 'Jumbo', 'Jumbo'
        MIXTO = 'Mixto', 'Mixto'

    class EstadoOperacion(models.TextChoices):
        COMPLETADO = 'Completado', 'Completado'
        PENDIENTE = 'Pendiente', 'Pendiente'
        CANCELADO = 'Cancelado', 'Cancelado'

    finanzas_ud_avicola_id = models.AutoField(primary_key=True)
    fnzs_fecha_operacion = models.DateField()
    fnzs_concepto_operacion = models.CharField(max_length=255)
    fnzs_tipo_operacion = models.CharField(max_length=7, choices=TipoOperacion.choices)
    fnzs_categoria_gasto = models.CharField(max_length=50, null=True, blank=True)
    fnzs_cantidad = models.IntegerField(default=0)
    fnzs_precio_unitario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fnzs_clasificacion_panal = models.CharField(max_length=5, choices=ClasificacionPanal.choices, null=True, blank=True)
    fnzs_precio_panal = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fnzs_panales_vendidos = models.IntegerField(default=0, null=True, blank=True)
    fnzs_monto_total = models.DecimalField(max_digits=12, decimal_places=2)
    fnzs_estado_operacion = models.CharField(max_length=10, choices=EstadoOperacion.choices, default=EstadoOperacion.COMPLETADO)
    galpon = models.ForeignKey('galpones.Galpon', on_delete=models.RESTRICT, db_column='galpon_id', related_name='transacciones')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.RESTRICT, db_column='usuario_id', related_name='transacciones')

    class Meta:
        managed = False
        db_table = 'finanzas_ud_avicola'

    def __str__(self):
        return f"{self.fnzs_tipo_operacion}: {self.fnzs_concepto_operacion} (${self.fnzs_monto_total})"
