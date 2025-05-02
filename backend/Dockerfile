# build maven image for spring boot app
FROM maven:3.8.4-openjdk-17 AS build

# working direactory inside container
WORKDIR /app

# copying pom.xml and use dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# copying src directory to container
COPY src ./src

RUN mvn clean package -DskipTests

# FROM openjdk:17-jdk-alpine
FROM openjdk:17-jdk-slim

WORKDIR /app

# COPY --from=build /app/target/darlastoresbackend-2.0-SNAPSHOT.jar .
COPY --from=build /app/target/DarlaStores-0.0.1-SNAPSHOT.jar .

EXPOSE 8080

ENTRYPOINT [ "java", "-jar", "/app/DarlaStores-0.0.1-SNAPSHOT.jar" ]
