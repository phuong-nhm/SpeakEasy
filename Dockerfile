# ==========================================
# STAGE 1: Runtime
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# ==========================================
# STAGE 2: SDK để Restore & Build
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 1. Copy NuGet.Config và file .csproj vào đúng cấu trúc để cache
COPY ["NuGet.Config", "./"]
COPY ["EnglishLearningApp/EnglishLearningApp.csproj", "EnglishLearningApp/"]

# 2. Restore NuGet packages
RUN dotnet restore "EnglishLearningApp/EnglishLearningApp.csproj"

# 3. Copy toàn bộ code Backend và tiến hành Publish
COPY EnglishLearningApp/ EnglishLearningApp/
WORKDIR "/src/EnglishLearningApp"
RUN dotnet publish "EnglishLearningApp.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==========================================
# STAGE 3: Final Image
# ==========================================
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "EnglishLearningApp.dll"]