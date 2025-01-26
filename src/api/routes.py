"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, My_Plans, Perfil
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
import re

api = Blueprint('api', __name__)

EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")
MSG_MISSING_DATA = "All data is required"
MSG_INVALID_DATA = "Invalid data"
MSG_EMAIL_EXISTS = "The email already exists!"
MSG_SUCCESS = "User registered successfully"

# Allow CORS requests to this API
CORS(api)

data = {
    "id": "chatcmpl-ArsEiFnCkJklDlFDuGTZL1sGwrbkp",
  "object": "chat.completion",
  "created": 1737403232,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "¡Claro! Aquí te dejo un menú semanal que incluye carne y arroz, con las cantidades aproximadas de productos a comprar para realizar las comidas, las recetas de cada una y la cantidad de calorías de cada una de ellas:\n\n**Lunes**\n- Comida: Pollo al horno con arroz blanco\n  - Ingredientes: 500g de pechuga de pollo, 1 taza de arroz\n  - Calorías: Aproximadamente 400 kcal por porción\n\n**Martes**\n- Comida: Bistec a la parrilla con arroz integral y verduras\n  - Ingredientes: 500g de bistec, 1 taza de arroz integral, verduras al gusto\n  - Calorías: Aproximadamente 450 kcal por porción\n\n**Miércoles**\n- Comida: Albóndigas de carne con salsa de tomate y arroz blanco\n  - Ingredientes: 500g de carne molida, 1 taza de arroz, salsa de tomate\n  - Calorías: Aproximadamente 350 kcal por porción\n\n**Jueves**\n- Comida: Chuletas de cerdo a la plancha con arroz blanco y ensalada\n  - Ingredientes: 500g de chuletas de cerdo, 1 taza de arroz, verduras para ensalada\n  - Calorías: Aproximadamente 400 kcal por porción\n\n**Viernes**\n- Comida: Tacos de carne con arroz y frijoles\n  - Ingredientes: 500g de carne para tacos, tortillas de maíz, arroz, frijoles\n  - Calorías: Aproximadamente 500 kcal por porción\n\n**Sábado**\n- Comida: Lomo de res al horno con arroz integral y brócoli al vapor\n  - Ingredientes: 500g de lomo de res, 1 taza de arroz integral, brócoli\n  - Calorías: Aproximadamente 450 kcal por porción\n\n**Domingo**\n- Comida: Estofado de carne con patatas y arroz blanco\n  - Ingredientes: 500g de carne para estofado, patatas, 1 taza de arroz\n  - Calorías: Aproximadamente 400 kcal por porción\n\nPara esta propuesta, puedes anticipar la compra de al menos 3kg de carne (pollo, bistec, carne molida, chuletas, carne para tacos, lomo de res y carne para estofado), 2kg de arroz (blanco e integral) y las verduras y/o frutas que prefieras para las ensaladas y guarniciones. ¡Espero que esta propuesta te sea útil!",
        "refusal": "null"
      },
      "logprobs": "null",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 80,
    "completion_tokens": 621,
    "total_tokens": 701,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "service_tier": "default",
  "system_fingerprint": "null"

}


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

# Endpoint para registrar un nuevo usuario.
@api.route('/register', methods=['POST'])
def register():
    """
    Endpoint para registrar un nuevo usuario.
    Recibe un JSON con 'user', 'email' y 'password'.
    Retorna un token JWT si el registro es exitoso.
    """
    user = request.json.get('user', None)
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    # Validar datos faltantes
    if not user or not email or not password:
        return jsonify({"msg": MSG_MISSING_DATA}), 400

    # Validar formato de datos
    if not isinstance(user, str) or not isinstance(email, str) or not isinstance(password, str) or not EMAIL_REGEX.match(email):
        return jsonify({"msg": MSG_INVALID_DATA}), 400

     # Validar la longitud de la contraseña
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    # Verificar si el correo o el usuario ya existen
    existing_user = Users.query.filter(
        (Users.email == email) | (Users.user == user)
    ).first()
    if existing_user:
        if existing_user.email == email and existing_user.user == user:
            return jsonify({"msg": "The email and username already exist. Please use another email and username."}), 409
        elif existing_user.email == email:
            return jsonify({"msg": "The email already exists. Please use another email."}), 409
        elif existing_user.user == user:
            return jsonify({"msg": "The username already exists. Please use another username."}), 409

    try:
        # Crear un nuevo usuario con contraseña encriptada
        hashed_password = generate_password_hash(password)
        new_user = Users(
            user=user,
            email=email,
            password=hashed_password,
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        new_profile = Perfil(
            user_id=new_user.id,
            name="",
            alergenos={},
            comensales=0,
            condicion={}
        )
        db.session.add(new_profile)
        db.session.commit()
        
        # Crear y retornar el token JWT
        token = create_access_token(identity=str(new_user.id))
        return jsonify({"msg": MSG_SUCCESS, "token": token}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
    

# Endpoint para obtener todos los usuarios de la base de datos.
@api.route('/users', methods=['GET'])
def get_users():
    """
    Endpoint para obtener todos los usuarios.
    Retorna una lista de usuarios serializados en formato JSON.
    Ejemplo de respuesta:
    {
        "msg": "Usuarios obtenidos correctamente",
        "payload": [
            {
                "id": 1,
                "user": "user1",
                "email": "user1@example.com"
            },
            ...
        ]
    }
    """
    try:
        # Obtener todos los usuarios de la base de datos
        users = Users.query.all()
        
        # Si no hay usuarios, retornar un mensaje adecuado
        if not users:
            return jsonify({"msg": "No users found"}), 404

        # Serializar los usuarios y devolverlos
        users_serialized = [user.serialize() for user in users]
        return jsonify({
            "msg": "Usuarios obtenidos correctamente",
            "payload": users_serialized
        }), 200

    except SQLAlchemyError as e:
        # Manejo de errores específicos de la base de datos
        return jsonify({
            "msg": "Error al obtener los usuarios",
            "error": f"Database query failed: {str(e)}"
        }), 500
    except Exception as e:
        # Manejo de errores generales
        return jsonify({
            "msg": "Unexpected error",
            "error": str(e)
        }), 500
    

# Endpoint para obtener usuario por id.
@api.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Endpoint para obtener un solo usuario por su ID.
    Retorna el usuario serializado.
    """
    try:
        # Obtener el usuario por ID
        user = Users.query.get(user_id)
        
         # Si no hay usuarios, retornar un mensaje adecuado
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Serializar el usuario y devolverlo
        return jsonify({
            "msg": "Usuario obtenido correctamente",
            "payload": user.serialize()
        }), 200

    except SQLAlchemyError as e:
        # Manejo de errores específicos de la base de datos
        return jsonify({
            "msg": "Error al obtener el usuario",
            "error": f"Database query failed: {str(e)}"
        }), 500
    except Exception as e:
        # Manejo de errores generales
        return jsonify({
            "msg": "Unexpected error",
            "error": str(e)
        }), 500
    

# Endpoint para obtener usuario por usuario o email.
@api.route('/users/search', methods=['GET'])
def search_user():
    """
    Endpoint para buscar un usuario por nombre de usuario o correo electrónico.
    Recibe parámetros de consulta 'user' o 'email'.
    """
    # Obtener el usuario por nombre de usuario o email
    user = request.args.get('user', None)
    email = request.args.get('email', None)

    # Si no hay parámetros de búsqueda, retorna mensaje
    if not user and not email:
        return jsonify({"msg": "Debe proporcionar un nombre de usuario o un correo electrónico para la búsqueda."}), 400

    try:
        if user:
            user_found = Users.query.filter_by(user=user).first()
        elif email:
            user_found = Users.query.filter_by(email=email).first()

        if user_found:
            return jsonify({
                "msg": "Usuario encontrado",
                "payload": user_found.serialize()
            }), 200
        else:
            return jsonify({"msg": "Usuario no encontrado"}), 404

    except SQLAlchemyError as e:
        # Manejo de errores específicos de la base de datos
        return jsonify({
            "msg": "Error al buscar el usuario",
            "error": f"Database query failed: {str(e)}"
        }), 500
    except Exception as e:
        # Manejo de errores generales
        return jsonify({
            "msg": "Unexpected error",
            "error": str(e)
        }), 500
    
# Endpoint para editar los datos de usuario.
@api.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Endpoint para actualizar los datos de un usuario existente.
    """
    # Buscar el usuario en la base de datos por su ID
    user = Users.query.get(user_id)
    
    if user is None:
        # Retornar error si el usuario no existe
        return jsonify({"error": "User not found"}), 404

    # Obtener los datos enviados en el cuerpo de la solicitud
    data = request.get_json()

    if not data:
        # Retornar error si no se envían datos
        return jsonify({"error": "No data provided"}), 400

    # Validar y actualizar el nombre de usuario
    username = data.get("user")
    if username:
        if not isinstance(username, str) or len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters long"}), 400
        user.user = username

    # Validar y actualizar el correo electrónico si está presente
    if "email" in data:
        if not EMAIL_REGEX.match(data["email"]):
            # Retornar error si el formato del correo es inválido
            return jsonify({"error": "Invalid email format"}), 400
        user.email = data["email"]

    # Validar y actualizar la contraseña si está presente
    if "password" in data:
        if not isinstance(data["password"], str) or len(data["password"]) < 8:
            # Retornar error si la contraseña no cumple con los requisitos mínimos
            return jsonify({"error": "Password must be at least 8 characters long"}), 400
        user.password = generate_password_hash(data["password"])  # Hashear la nueva contraseña

    # Validar y actualizar el estado de actividad si está presente
    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            # Retornar error si el valor de 'is_active' no es un booleano
            return jsonify({"error": "Invalid value for 'is_active'. Must be a boolean"}), 400
        user.is_active = data["is_active"]

    # Guardar los cambios en la base de datos
    try:
        db.session.commit()
        # Retornar mensaje de éxito con los datos actualizados del usuario
        return jsonify({
            "message": f"User {user.user} and {user.email} updated successfully",
            "user": user.serialize()
        }), 200
    except SQLAlchemyError as e:
        # Manejo de errores relacionados con la base de datos
        db.session.rollback()
        return jsonify({
            "error": "Database error",
            "details": str(e)
        }), 500
    except Exception as e:
        # Manejo de errores generales no previstos
        db.session.rollback()
        return jsonify({
            "error": "Unexpected error",
            "details": str(e)
        }), 500

# Endpoint para eliminar usuario por id.
@api.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    Endpoint para eliminar un usuario por su ID.
    """
    try:
        # Obtener el usuario por ID
        user = Users.query.get(user_id)
        
        # Si no se encuentra el usuario, retornar un mensaje adecuado
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Eliminar el perfil asociado al usuario
        perfil = Perfil.query.filter_by(user_id=user_id).first()
        if perfil:
            db.session.delete(perfil)
            
        # Eliminar el usuario
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "msg": f"User {user.user} with email {user.email} deleted successfully"
        }), 200

    except SQLAlchemyError as e:
        # Manejo de errores específicos de la base de datos
        db.session.rollback()
        return jsonify({
            "msg": "Error al eliminar el usuario",
            "error": f"Database query failed: {str(e)}"
        }), 500
    except Exception as e:
        # Manejo de errores generales
        db.session.rollback()
        return jsonify({
            "msg": "Unexpected error",
            "error": str(e)
        }), 500
    

# Endpoint para login de usuario por email.
@api.route('/login', methods=['POST'])
def login():
    """
    Endpoint para login de usuario.
    Permite iniciar sesión con nombre de usuario o correo electrónico y contraseña.
    """
    identifier = request.json.get('identifier', None)
    password = request.json.get('password', None)

    if not identifier or not password:
        return jsonify({"msg": "Todos los datos son necesarios"}), 400

    try:
        user = Users.query.filter(
            (Users.email == identifier) | (Users.user == identifier)
        ).first()
        if not user:
            return jsonify({"msg": "User not found"}), 404
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({"msg": "Credenciales inválidas"}), 401

        # Generar el token de acceso
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "msg": "Inicio de sesión exitoso",
            "token": token,
            "user_id": user.id
        }), 200

    except SQLAlchemyError as e:
        return jsonify({
            "msg": "Error de base de datos",
            "error": f"Database query failed: {str(e)}"
        }), 500
    except Exception as e:
        return jsonify({
            "msg": "Error interno",
            "error": str(e)
        }), 500


@api.route('/user_info', methods=['GET'])
@jwt_required()
def get_user_info():
    try:
        id = get_jwt_identity()  # Obtiene el ID del usuario desde el token
        user = Users.query.get(id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
        return jsonify({
            "success": True,
            "msg": "Información del usuario obtenida con éxito",
            "payload": user.serialize()
        }), 200
    except Exception as e:
        print(f"Error interno: {str(e)}")
        return jsonify({"success": False, "msg": "Error interno del servidor", "error": str(e)}), 500
    
    
# Endpoint para obtener todos los planes
@api.route('/plans', methods=['GET'])
def get_all_plans():
    """
    Endpoint para obtener todos los planes.
    Retorna una lista de planes serializados en formato JSON.
    """
    try:
        plans = My_Plans.query.all()
        if not plans:
            return jsonify({"msg": "No plans found"}), 404
        
        plans_serialized = [plan.serialize() for plan in plans]
        return jsonify({
            "msg": "Planes obtenidos correctamente",
            "payload": plans_serialized
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"msg": "Error al obtener los planes", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"msg": "Unexpected error", "error": str(e)}), 500

@api.route('/plans/<int:user_id>', methods=['GET'])
def get_plans_by_user(user_id):
    try:
        # Consulta para obtener todos los registros con el user_id proporcionado
        plans = My_Plans.query.filter_by(user_id=user_id).all()

        # Serializar los resultados
        serialized_plans = [plan.serialize() for plan in plans]

        # Responder con los planes o un mensaje si no hay resultados
        if serialized_plans:
            return jsonify({"status": "success", "data": serialized_plans}), 200
        else:
            return jsonify({"status": "success", "message": "No plans found for this user_id"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Endpoint para obtener un plan por ID
@api.route('/plan/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    """
    Endpoint para obtener un solo plan por su ID.
    """
    try:
        plan = My_Plans.query.get(plan_id)
        if not plan:
            return jsonify({"msg": "Plan not found"}), 404
        
        return jsonify({
            "msg": "Plan obtenido correctamente",
            "payload": plan.serialize()
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"msg": "Error al obtener el plan", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"msg": "Unexpected error", "error": str(e)}), 500
    

@api.route('/plans', methods=['POST'])
def create_plan():
    """
    Crea un nuevo plan y lo guarda en la base de datos.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"msg": "Datos no proporcionados"}), 400

        # Validar los campos necesarios
        required_fields = ["user_id", "plan", "create_at", "name"]
        for field in required_fields:
            if field not in data:
                return jsonify({"msg": f"El campo {field} es obligatorio"}), 400

        # Crear una nueva instancia de My_Plans
        new_plan = My_Plans(
            user_id=data["user_id"],
            plan=data["plan"],
            create_at=data["create_at"],  # Asegúrate de enviar la fecha en formato válido (YYYY-MM-DD)
            name=data["name"]
        )

        # Guardar en la base de datos
        db.session.add(new_plan)
        db.session.commit()

        return jsonify({"msg": "Plan creado correctamente", "plan": new_plan.serialize()}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al guardar el plan", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"msg": "Error inesperado", "error": str(e)}), 500

# Endpoint para actualizar un plan por ID
@api.route('/plan/<int:plan_id>', methods=['PUT'])
def update_plan(plan_id):
    """
    Endpoint para actualizar un plan por su ID.
    Recibe un JSON con los campos a actualizar.
    """
    try:
        plan = My_Plans.query.get(plan_id)
        if not plan:
            return jsonify({"msg": "Plan not found"}), 404
        
        data = request.get_json()

        # Actualizar los campos permitidos
        plan.user_id = data.get('user_id', plan.user_id)
        plan.plan = data.get('plan', plan.plan)
        plan.create_at = data.get('create_at', plan.create_at)
        plan.name = data.get('name', plan.name)

        db.session.commit()
        return jsonify({"msg": "Plan actualizado correctamente", "payload": plan.serialize()}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el plan", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"msg": "Unexpected error", "error": str(e)}), 500


# Endpoint para eliminar un plan por ID
@api.route('/plan/<int:plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    """
    Endpoint para eliminar un plan por su ID.
    """
    try:
        plan = My_Plans.query.get(plan_id)
        if not plan:
            return jsonify({"msg": "Plan not found"}), 404
        
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"msg": "Plan eliminado correctamente"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el plan", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"msg": "Unexpected error", "error": str(e)}), 500

# Endpoint para obtener todos los perfiles
@api.route('/perfiles', methods=['GET'])
def get_perfiles():
    """
    Obtiene todos los perfiles en la base de datos.
    """
    try:
        perfiles = Perfil.query.all()
        if not perfiles:
            return jsonify({"msg": "No hay perfiles disponibles"}), 404
        perfiles_serializados = [perfil.serialize() for perfil in perfiles]
        return jsonify({"msg": "Perfiles obtenidos correctamente", "perfiles": perfiles_serializados}), 200
    except SQLAlchemyError as e:
        return jsonify({"msg": "Error al obtener perfiles", "error": str(e)}), 500

# Endpoint para obtener un perfil por ID
@api.route('/perfil/<int:perfil_id>', methods=['GET'])
def get_perfil(perfil_id):
    """
    Obtiene un perfil por su ID.
    """
    try:
        perfil = Perfil.query.get(perfil_id)
        if not perfil:
            return jsonify({"msg": "Perfil no encontrado"}), 404
        return jsonify({"msg": "Perfil obtenido correctamente", "perfil": perfil.serialize()}), 200
    except SQLAlchemyError as e:
        return jsonify({"msg": "Error al obtener el perfil", "error": str(e)}), 500
    
@api.route('/perfil/pf/<int:user_id>', methods=['GET'])
def get_perfiles_by_user_id(user_id):
    try:
        # Consulta los perfiles asociados al user_id
        perfiles = Perfil.query.filter_by(user_id=user_id).all()
        
        # Si no se encuentran resultados
        if not perfiles:
            return jsonify({"message": f"No se encontraron perfiles para el user_id {user_id}"}), 404

        # Serializa los perfiles y envía la respuesta
        return jsonify([perfil.serialize() for perfil in perfiles]), 200
    except Exception as e:
        return jsonify({"error": f"Ocurrió un error: {str(e)}"}), 500


# Endpoint para actualizar un perfil por ID
@api.route('/perfil/<int:perfil_id>', methods=['PUT'])
def update_perfil(perfil_id):
    """
    Actualiza los datos de un perfil existente.
    """
    try:
        perfil = Perfil.query.get(perfil_id)
        if not perfil:
            return jsonify({"msg": "Perfil no encontrado"}), 404

        data = request.json
        if not data:
            return jsonify({"msg": "Datos no proporcionados"}), 400

        # Actualizar campos opcionales si están presentes
        perfil.name = data.get("name", perfil.name)
        perfil.alergenos = data.get("alergenos", perfil.alergenos)
        perfil.comensales = data.get("comensales", perfil.comensales)
        perfil.condicion = data.get("condicion", perfil.condicion)

        db.session.commit()
        return jsonify({"msg": "Perfil actualizado correctamente", "perfil": perfil.serialize()}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el perfil", "error": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error inesperado", "error": str(e)}), 500
    

@api.route('/perfil/edit/<int:user_id>', methods=['PUT'])
def update_perfil_user(user_id):
    """
    Actualiza los datos de un perfil existente basado únicamente en user_id.
    """
    try:
        # Buscar el perfil por user_id
        perfil = Perfil.query.filter_by(user_id=user_id).first()
        if not perfil:
            return jsonify({"msg": "Perfil no encontrado para este usuario"}), 404

        data = request.json
        if not data:
            return jsonify({"msg": "Datos no proporcionados"}), 400

        # Actualizar campos opcionales si están presentes
        perfil.name = data.get("name", perfil.name)
        perfil.alergenos = data.get("alergenos", perfil.alergenos)
        perfil.comensales = data.get("comensales", perfil.comensales)
        perfil.condicion = data.get("condicion", perfil.condicion)

        db.session.commit()
        return jsonify({"msg": "Perfil actualizado correctamente", "perfil": perfil.serialize()}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el perfil", "error": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error inesperado", "error": str(e)}), 500


# Endpoint para eliminar un perfil por ID
@api.route('/perfil/<int:perfil_id>', methods=['DELETE'])
def delete_perfil(perfil_id):
    """
    Elimina un perfil por su ID.
    """
    try:
        perfil = Perfil.query.get(perfil_id)
        if not perfil:
            return jsonify({"msg": "Perfil no encontrado"}), 404

        db.session.delete(perfil)
        db.session.commit()
        return jsonify({"msg": "Perfil eliminado correctamente"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el perfil", "error": str(e)}), 500

@api.route('/perfil', methods=['POST'])
@jwt_required()  # Requiere autenticación con JWT
def create_perfil():
    """
    Endpoint para crear un nuevo perfil.
    Recibe un JSON con 'user_id', 'name', 'alergenos', 'comensales', y 'condicion'.
    Retorna el perfil creado si la operación es exitosa.
    """
    # Obtener los datos enviados en el cuerpo de la solicitud
    data = request.get_json()

    # Validar que los datos requeridos estén presentes
    if not data:
        return jsonify({"msg": "No se enviaron datos"}), 400

    user_id = data.get('user_id')
    name = data.get('name')
    alergenos = data.get('alergenos', {})
    comensales = data.get('comensales')
    condicion = data.get('condicion', {})

    if not user_id or not name or comensales is None:
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    try:
        # Crear el nuevo perfil
        new_perfil = Perfil(
            user_id=user_id,
            name=name,
            alergenos=alergenos,
            comensales=comensales,
            condicion=condicion
        )
        db.session.add(new_perfil)
        db.session.commit()

        # Retornar el perfil creado
        return jsonify({
            "msg": "Perfil creado exitosamente",
            "perfil": new_perfil.serialize()
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error al crear el perfil",
            "error": str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error inesperado",
            "error": str(e)
        }), 500

@api.route('/static-data', methods=['GET'])
def get_static_data():
    return jsonify(data), 200