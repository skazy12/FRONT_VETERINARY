pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Asegúrate de que este nombre coincida
    }

    stages {
        stage('Environment Preparation') {
            steps {
                echo 'Preparing environment...'
                cleanWs()
                checkout scm
                sh 'node -v' // Muestra la versión de Node
                sh 'npm -v'  // Muestra la versión de npm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
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
                sh 'npm test -- --watchAll=false'
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                }
            }
        }

        // Otras etapas...

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
