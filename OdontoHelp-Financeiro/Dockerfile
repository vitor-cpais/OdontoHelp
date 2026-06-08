FROM maven:3.9.6-eclipse-temurin-22 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:22-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/financeiro-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx256m", "-Xss512k", "-jar", "app.jar"]
