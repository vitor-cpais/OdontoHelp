FROM maven:3.9-eclipse-temurin-22 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -S fiscal && adduser -S fiscal -G fiscal
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/certs && chown -R fiscal:fiscal /app
USER fiscal
EXPOSE 8082
ENV JAVA_OPTS="-Djdk.security.legacyAlgorithms=SHA1withRSA -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
