pipeline {
    agent any

    // Definición de herramientas
    tools {
        nodejs 'NodeJS' // Asegúrate de que tengas NodeJS configurado en Jenkins
    }

    // Variables de entorno
    environment {
        // Variables del proyecto
        PROJECT_NAME = 'veterinaria-frontend'
        APP_PORT = '3000'
        // Añadir rutas de herramientas al PATH
        PATH = "${env.PATH}"
    }

    // Opciones generales del pipeline
    options {
        // Timeout global
        timeout(time: 1, unit: 'HOURS')
        // No permitir ejecuciones concurrentes
        disableConcurrentBuilds()
        // Mantener los últimos builds
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    // Triggers del pipeline (opcional)
    triggers {
        // Revisar SCM cada hora
        pollSCM('H */1 * * *')
    }

    stages {
        // Etapa de preparación del ambiente
        stage('Environment Preparation') {
            steps {
                echo 'Preparing environment...'
                // Limpiar workspace
                cleanWs()
                // Checkout del código
                checkout scm

                // Mostrar versión de Node
                sh 'node -v'
                sh 'npm -v'
            }
        }

        // Etapa de instalación de dependencias
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        // Etapa de compilación
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
            post {
                success {
                    echo 'Build successful!'
                    // Archivar artefactos generados
                    archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                }
            }
        }

        // Etapa de pruebas unitarias
        stage('Unit Tests') {
            steps {
                echo 'Running unit tests...'
                sh 'npm test -- --watchAll=false'
            }
            post {
                always {
                    // Publicar resultados de pruebas
                    junit 'test-results/**/*.xml'
                }
            }
        }

        // Etapa de análisis de código (si lo deseas)
        stage('Code Analysis') {
            steps {
                echo 'Running code analysis...'
                // Aquí puedes ejecutar ESLint o cualquier otra herramienta
                sh 'npm run lint'
            }
        }

        // Etapa de despliegue en desarrollo (ajusta según tu entorno)
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to development environment...'
                // Aquí irían tus comandos de despliegue
                // Ejemplo: sh 'some-deploy-command'
            }
        }

        // Etapa de despliegue en producción
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Pedir aprobación manual
                input message: '¿Deseas desplegar a producción?'
                echo 'Deploying to production environment...'
                // Aquí irían tus comandos de despliegue a producción
            }
        }
    }

    // Acciones post-ejecución
    post {
        always {
            echo 'Pipeline finished execution'
            // Limpiar workspace
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully!'
            // Aquí puedes agregar notificaciones de éxito
        }
        failure {
            echo 'Pipeline execution failed!'
            // Aquí puedes agregar notificaciones de fallo
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}
