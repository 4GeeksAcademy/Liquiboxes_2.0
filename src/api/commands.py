import click
from flask.cli import with_appcontext
from api.models import db, User, Admin_User, Shop, MysteryBox
from werkzeug.security import generate_password_hash
import random
from faker import Faker

fake = Faker('es_ES')

CATEGORIES = ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga']

COLORES = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Blanco', 'Negro', 'Gris']

TAMANOS = ['Pequeño', 'Mediano', 'Grande']

OBJETOS_POR_CATEGORIA = {
    'Moda': ['Camiseta', 'Pantalón', 'Vestido', 'Chaqueta', 'Zapatos', 'Bufanda', 'Sombrero'],
    'Ropa de Trabajo': ['Mono de trabajo', 'Botas de seguridad', 'Casco', 'Guantes', 'Chaleco reflectante'],
    'Tecnología': ['Auriculares', 'Cargador', 'Funda de móvil', 'Soporte para portátil', 'Ratón inalámbrico'],
    'Carpintería': ['Martillo', 'Destornillador', 'Cinta métrica', 'Lija', 'Pincel'],
    'Outdoor': ['Linterna', 'Navaja multiusos', 'Botella de agua', 'Brújula', 'Mochila pequeña'],
    'Deporte': ['Pelota', 'Banda elástica', 'Toalla deportiva', 'Botella de agua', 'Calcetines deportivos'],
    'Arte': ['Pinceles', 'Cuaderno de dibujo', 'Lápices de colores', 'Acuarelas', 'Lienzo pequeño'],
    'Cocina': ['Delantal', 'Utensilios de madera', 'Especias', 'Molde para hornear', 'Libro de recetas'],
    'Jardinería': ['Guantes de jardín', 'Semillas', 'Pala pequeña', 'Regadera', 'Maceta'],
    'Música': ['Púas de guitarra', 'Afinador', 'Partitura', 'Audífonos', 'Limpiador de instrumento'],
    'Viajes': ['Almohada de viaje', 'Antifaz para dormir', 'Adaptador universal', 'Neceser', 'Etiqueta para maleta'],
    'Lectura': ['Marcapáginas', 'Funda para libro', 'Luz de lectura', 'Libreta', 'Lápiz'],
    'Cine': ['Entradas de cine', 'Palomitas gourmet', 'Figura de personaje', 'Póster de película', 'Gafas 3D'],
    'Fotografía': ['Tarjeta de memoria', 'Paño de limpieza', 'Mini trípode', 'Funda para cámara', 'Filtro para lente'],
    'Yoga': ['Esterilla', 'Bloque de yoga', 'Cinta elástica', 'Bolsa para esterilla', 'Botella de agua']
}

def setup_commands(app):
    
    @app.cli.command("insert-test-users")
    @click.argument("count")
    def insert_test_users(count):
        print("Creando usuarios de prueba")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = f"usuario_prueba{x}@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print(f"Usuario: {user.email} creado.")
        print("Todos los usuarios de prueba han sido creados")

    @app.cli.command("create_superuser")
    @click.option('--name', prompt=True)
    @click.option('--surname', prompt=True)
    @click.option('--email', prompt=True)
    @click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True)
    def create_superuser(name, surname, email, password):
        if Admin_User.query.filter_by(is_superuser=True).first():
            click.echo('Ya existe un superusuario.')
            return

        superuser = Admin_User(
            name=name,
            surname=surname,
            email=email,
            is_superuser=True,
            is_active=True
        )
        superuser.set_password(password)

        db.session.add(superuser)
        db.session.commit()

        click.echo(f'Superusuario {email} creado exitosamente.')

    @app.cli.command("init_db")
    def init_db():
        """Inicializar la base de datos con tiendas y cajas misteriosas de muestra."""
        click.echo("Inicializando la base de datos...")

        # Combina todos los objetos de todas las categorías en una lista única
        all_items = [item for items in OBJETOS_POR_CATEGORIA.values() for item in items]

        # Crear tiendas
        for i in range(10):
            shop_categories = random.sample(CATEGORIES, random.randint(1, 3))
            shop = Shop(
                name=fake.company(),
                email=fake.email(),
                address=fake.address(),
                postal_code=fake.postcode(),
                categories=shop_categories,
                business_core=fake.catch_phrase(),
                shop_description=fake.paragraph(),
                shop_summary=fake.sentence(),
                image_shop_url=f"https://picsum.photos/seed/{i}/300/200",
                owner_name=fake.first_name(),
                owner_surname=fake.last_name()
            )
            shop.set_password('12345678')
            db.session.add(shop)
            db.session.commit()

            # Crear cajas misteriosas para cada tienda
            for j in range(5):
                # Selecciona 10 objetos aleatorios de la lista combinada, sin importar la categoría
                possible_items = random.sample(all_items, 10)

                box = MysteryBox(
                    name=f"Caja Misteriosa {j+1}",
                    description=fake.paragraph(),
                    price=round(random.uniform(10, 100), 2),
                    size=random.choice(TAMANOS),
                    possible_items=possible_items,
                    image_url=f"https://picsum.photos/seed/{i*10+j}/300/200",
                    number_of_items=random.randint(1, 3),
                    shop_id=shop.id
                )
                db.session.add(box)

        db.session.commit()
        click.echo("Base de datos inicializada con 10 tiendas y 50 cajas misteriosas.")
