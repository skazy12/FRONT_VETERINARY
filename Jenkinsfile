pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Asegúrate de que este nombre coincida con tu configuración en Jenkins
    }

    stages {
        stage('Environment Preparation') {
            steps {
                echo 'Preparing environment...'
                cleanWs()
                checkout scm
                bat 'node -v' // Muestra la versión de Node
                bat 'npm -v'  // Muestra la versión de npm
            }
        }

        stage('Test Git') {
            steps {
                script {
                    def gitVersion = bat(script: 'git --version', returnStdout: true).trim()
                    echo "Git Version: ${gitVersion}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm install' // Cambiado a bat
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                bat 'npm run build' // Cambiado a bat
            }
            post {
                success {
                    echo 'Build successful!'
                    archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                }
            }
        }

        stage('Unit Tests') {
            steps {
                echo 'Running unit tests...'
                bat 'npm test -- --watchAll=false --passWithNoTests' // Agregado --passWithNoTests
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                }
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to development environment...'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: '¿Deseas desplegar a producción?'
                echo 'Deploying to production environment...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished execution'
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
        }
    }
}
