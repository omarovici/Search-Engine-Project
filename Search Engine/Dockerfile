# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app
COPY . ./
RUN dotnet restore "Search Engine.csproj"
RUN dotnet publish "Search Engine.csproj" -c Release -o out --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build-env /app/out .
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV LD_LIBRARY_PATH=/usr/lib
# Use non-root user for security
RUN adduser -u 1001 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser
ENV ASPNETCORE_URLS=http://+:5062
EXPOSE 5062
ENTRYPOINT ["dotnet", "Search Engine.dll"]