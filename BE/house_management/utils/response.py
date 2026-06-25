# utils/response.py
from rest_framework.response import Response

def standard_response(success=True, message="", data=None, status=200):
    response_data = {
        "success": success,
        "message": message,
    }
    
    if data is not None:
        response_data["data"] = data
        
    return Response(response_data, status=status)