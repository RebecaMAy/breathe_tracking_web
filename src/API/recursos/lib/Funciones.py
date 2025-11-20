#LIBRERIAS
import base64

#LLAMADA A BBDDD
from recursos.lib.ConexionBBDD import db

"""
-----------------------------------------
str -> obtener_usuario() -> dict OR None
-----------------------------------------
Recibe: Correo (ID del documento)
-----------------------------------------
Devuelve: JSON del usuario
-----------------------------------------
"""
def obtener_usuario(correo):
    doc_ref = db.collection('usuarios').document(correo)
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict()
    return None

"""
-----------------------------------------
dict, str -> validacion_token() -> True OR False
-----------------------------------------
Recibe: JSON del usuario y token
-----------------------------------------
Devuelve: True OR False
-----------------------------------------
"""
def validacion_token(datos_usuario, token):
    return datos_usuario.get('token') == token

"""
-----------------------------------------
str -> validacion_token() -> str
-----------------------------------------
Recibe: Dato sin hashear
-----------------------------------------
Devuelve: Dato hasheado
-----------------------------------------
"""
def codificar_parametro(valor):
    return base64.urlsafe_b64encode(valor.encode()).decode()