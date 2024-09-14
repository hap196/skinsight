
user_schema = {
    'firstName': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'lastName': {
        'type': 'string',
        'minlength': 1,
        'required': True,
    },
    'email': {
        'type': 'string',
        "required": False,
    },
    'userId': {
        'type': 'int',
        'required': True,
    },
    'patientId': {
        'type': 'int',
        'required': True,
    },
    'age': {
        'type': 'int'
    },
    "userStatus": {
        "type": "int"
    }
}