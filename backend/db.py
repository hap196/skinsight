import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://hpan27:pWB7olVPWaa0xs4k@flaskbackend.omxi6.mongodb.net/?retryWrites=true&w=majority&appName=flaskbackend"

# create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

db = client.get_database('skinsight')
user_collection = pymongo.collection.Collection(db, 'users')

# send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)