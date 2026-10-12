from fastapi import Header, HTTPException, status
import jwt  # Thư viện giải mã JWT (nếu chưa cài, chạy: pip install PyJWT)
async def get_current_token(authorization: str = Header(None)) -> str:
    """Dependency chỉ chuyên làm nhiệm vụ bóc và kiểm tra tính hợp lệ của token thô"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization Header format"
        )
    return authorization.split(" ")[1]
async def get_current_user(authorization: str = Header(None)) -> str:
    """
    Dependency kiểm tra header Authorization, giải mã JWT để lấy user_id.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials format. Use 'Bearer <token>'"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        # Ở môi trường thật, cậu sẽ decode bằng secret/public key từ hệ thống OpenIddict/ABP của cậu.
        # Tạm thời để verify_signature=False nếu đang test local hoặc decode payload trực tiếp:
        # payload = jwt.decode(token, options={"verify_signature": False})
        
        # Giả lập trích xuất sub (user_id) từ payload token chuẩn JWT
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub") or payload.get("nameidentifier")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not contain valid user identifier (sub)"
            )
            
        return str(user_id)
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )