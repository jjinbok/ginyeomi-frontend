# Ginyeomi FE

Expo / React Native 클라이언트.

에이전트 작업 시 Expo 버전 문서를 따릅니다: https://docs.expo.dev/versions/v56.0.0/

## Backend API reference (read-only)

서버 코드는 이 저장소에 없습니다. 형제 프로젝트의 Spring Boot 백엔드를 **읽기 전용 계약 참고**로만 사용합니다.

- **경로:** `/Users/ljb4582/Desktop/Service/Ginyeomi/Ginyeomi_BE/ginyeomi`
- **절대 금지:** `Ginyeomi_BE` 아래 파일 생성·수정·삭제·이동·커밋 (이 FE 작업 중에는 서버를 고치지 않음)
- **용도:** Controller / DTO를 보고 FE의 `api/`, 타입, 요청·응답 형태를 서버에 맞춤
- **진입점:** `src/main/java/com/girogi/ginyeomi/domain/*/controller`, `*/dto/request`, `*/dto/response`, `global/storage/ImageUploadController.java`
- **FE base URL:** `EXPO_PUBLIC_API_URL` (기본 `http://localhost:8080/api/v1`)
- **동기화:** 서버 코드는 계속 바뀔 수 있다. 사용자가 요청하면(예: "서버 다시 읽어", "rules 갱신") 그때 백엔드를 다시 읽고, 발견한 API·경로·DTO 변경을 `.cursor/rules/backend-api-reference.mdc`(및 필요 시 이 문서)에 반영한다. 추측으로 규칙을 갱신하지 않는다.
