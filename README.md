# image_manager

* Luis Alfredo Gallego Montoya - lgalle17@eafit.educo
* Jose Luis Alvarez Herrera - jalvar53@eafit.educo
* Alejandro Salgado Gomez - asalgad2@eafit.educo

# Descripción de aplicación

Aplicación web que permite gestionar imagenes con un simple CRUD de usuarios y archivos.

# 1. Análisis

## 1.1 Requisitos funcionales:

1. Crear imagen.
2. Buscar imagen por parte del titulo
3. Borrar articulo por titulo de imagen
4. Listar las difentes imagenes
5. Compartir y publicar imagenes

Nota: debido a que esta implementacion solo es una primera version algunos errores,
como el duplicar campos de la base de datos, despues de ser debidamente manejados
por el servidor, son informados al usuario mostrando el error generado en sintaxis
sql en la seccion de mensajes de la aplicacion.

## 1.2 Definición de tecnología de desarrollo y despliegue para la aplicación:

* Lenguaje de Programación: Javascript
* Framework web backend: NodeJS - Express
* Framework web frontend: no se usa - se utilizará Templates HTML para Vista (V)
* Base de datos: Mysql
* Web App Server: NodeJS
* Web Server: Apache Web Server

# 2. Desarrollo

La aplicacion se desarrollo siguiendo el patron MVC, cada uno de los componentes
de este patron se puede encontrar en su respectiva carpeta.

# 2.1 Estructura de carpetas

* app.js -> (main)
* installation
    - create_database.sql -> (script para la creacion de la base de datos)
    - install_dependencies.sh -> (script para la instalacion de dependencias de node)
* controller
    - index.js
* model
    - model.js
* views
    - account.ejs
    - home.ejs
    - logged.ejs
    - users.ejs
* node_modules -> (carpeta contenedora de las dependencias)
* package.json
* package-lock.json
* README.md

# 2.2 Dependencias

* express
* body-parser
* cookie-parser
* mysql
* ejs

# 3. Diseño:

## 3.1 Modelo de datos:

|user| 1---* |associations| *---1 |image|

* user
    - user: String -> (Primary key)
    - password: String

* associations
    - userid: String -> (Foreign key to user.user)
    - imageid: String -> (Foreign key to image.name)
    - owner: Bool

* image
    - name: String -> (Primary key)
    - type: String
    - size: int
    - dimension: String
    - private: Bool

## 3.2 Servicios Web

Servicio Web: Cierra una sesion de usuario
- Método: GET
- URI: /logout

- - -

Servicio Web: Consulta los usuarios existentes en la base de datos
- Método: GET
- URI: /read_users

- - -

Servicio Web: Acede a la pagina de manejo de cuenta para modificar informacion de un usuario
- Método: GET
- URI: /manage_account

- - -

Servicio Web: Busca las images publicas de la aplicacion
- Método: GET
- URI: /search_public_images

- - -

Servicio Web: Busca las images de un usuario
- Método: GET
- URI: /search_private_images

- - -

Servicio Web: Busca las images compartidas con un usuario
- Método: GET
- URI: /search_shared_images

- - -

Servicio Web: Busca las images de un usuario cuyo nombre contenga la substring de busqueda
- Método: GET
- URI: /search_user_images?img_serch=val

- - -

Servicio Web: Autentica al usuario contra la base de datos
- metodo: POST
- URI: /login

__Datos__:
- user
- password

- - -

Servicio Web: Registra a un usuario en la base de datos
- metodo: POST
- URI: /register

__Datos__:
- ruser
- rpassword
- rpassword2

- - -

Servicio Web: Borra a un usuario y todos sus archivos de la base de datos
- metodo: POST
- URI: /delete_user

__Datos__:
- password

- - -

Servicio Web: Actualiza el campo password de un usuario en la base de datos
- metodo: POST
- URI: /update_password

__Datos__:
- old_password
- new_password
- new_password2

- - -

Servicio Web: Crea una imagen a nombre de un usuario especifico
- metodo: POST
- URI: /create_image

__Datos__:
- name
- type
- size
- dimension
- scope (especifica si la imagen es publica o privada)

- - -

Servicio Web: Actualiza los datos de la imagen de un usuario en la base de datos
- metodo: POST
- URI: /update_image

__Datos__:
- name
- type
- size
- dimension
- scope (especifica si la imagen es publica o privada)

- - -

Servicio Web: Comparte o restringe el acceso a una imagen de un usuario
- metodo: POST
- URI: /share_image

__Datos__:
- user_share
- img_name_share
- share (especifica si la accion es de compartir o restringir)

- - -

Servicio Web: Borra la imagen de un usuario de la base de datos
- metodo: POST
- URI: /delete_image

__Datos__:
- del_img_name

- - -

Nota: el usuario es mantenido por una cookie la cual es creada por el metodo *login* cuando la autenticacion
es exitosa y es destruida por el metodo *logout*, es por esta razon que no se necesita la informacion del usuario
de manera explicita.

# 4. Despliegue en un Servidor Centos 7.x y digital ocean

## Instalacion de nodejs en el servidor

    $ sudo yum install wget
    $ wget http://springdale.math.ias.edu/data/puias/unsupported/7/x86_64//http-parser-2.7.1-3.sdl7.x86_64.rpm
    $ sudo yum install http-parser-2.7.1-3.sdl7.x86_64.rpm
    $ sudo yum install epel-release  # repositorio extra donde se encuentra el paquete de node
    $ sudo yum install nodejs

## Configuracion de hostnames

    Realizar la siguiente configuracion en todos los nodos
    $ sudo hostnamectl set-hostname <hostname>
    $ sudo vim /etc/hosts

    <ip_nodo1>  <hostname_nodo1>
    <ip_nodo2>  <hostname_nodo2>
    <ip_nodo3>  <hostname_nodo3>
    <ip_nodo4>  <hostname_nodo4>
    <ip_nodo5>  <hostname_nodo5>

## Configuracion de Corosync y pacemaker

    $ sudo yum install pacemaker # corosync es instalado como dependencia
    $ sudo yum install haveged # paquete para la creacion de la llave
    $ sudo corosync-keygen # generar la llave para permitir el acceso
    $ sudo cp authkey /etc/corosync # copiar la llave en los otros nodos
    $ sudo vim /etc/corosync/corosync.conf

    totem {
      version: 2
      cluster_name: <nombre cluster>
      transport: udpu
      interface {
        ringnumber: 0
        bindnetaddr: <ip red>
        broadcast: yes
        mcastport: 5405
      }
    }
    
    quorum {
      provider: corosync_votequorum
      two_node: 1
    }
    
    nodelist {
      node {
        ring0_addr: <hostname nodo1>
        name: <nombre nodo1>
        nodeid: 1
      }
      node {
        ring0_addr: <hostname nodo2>
        name: <nombre nodo2>
        nodeid: 2
      }
    }

    logging {
      to_logfile: yes
      logfile: /var/log/corosync/corosync.log
      to_syslog: yes
      timestamp: on
    }

    $ sudo mkdir /var/log/corosync

Configurar peacemaker

    $ sudo mkdir /etc/corosync/service.d
    $ sudo vim /etc/corosync/service.d/pcmk

    service {
        name: pacemaker
        ver: 1
    }

    $ sudo firewall-cmd --zone=public --add-port=5404/udp --permanent
    $ sudo firewall-cmd --zone=public --add-port=5405/udp --permanent
    $ sudo firewall-cmd --zone=public --add-port=5406/udp --permanent
    $ sudo firewall-cmd --reload

    $ sudo systemctl start corosync
    $ sudo systemctl enable corosync
    $ sudo systemctl start pacemaker
    $ sudo systemctl enable  pacemaker

    $ sudo corosync-cmapctl | grep member # Verificar que todos los nodos esten respondiendo

    $ sudo firewall-cmd --zone=public --add-service=high-availability --permanent
    $ sudo firewall-cmd --reload

    $ sudo yum install pcs
    $ sudo systemctl start pcsd
    $ sudo systemctl enable pcsd

    $ sudo passwd hacluster

Los siguientes comandos solo se necesitan ejecutar en un solo nodo

    $ sudo pcs cluster auth <hostname nodo1> <hostname nodo2>
    $ sudo pcs cluster start --all
    $ sudo pcs property set stonith-enabled=false
    $ sudo pcs property set no-quorum-policy=ignore

    $ sudo pcs resource create virtual_ip_haproxy ocf:heartbeat:IPaddr2 ip=<ip virtual> cidr_netmask=24 op monitor interval=10s

## Configuracion HAproxy privado

    $ sudo yum install haproxy
    $ sudo firewall-cmd --zone=public --add-service=http --permanent
    $ sudo firewall-cmd --reload
    $ sudo setsebool -P haproxy_connect_any 1
    $ sudo vim /etc/haproxy/haproxy.cfg

    frontend http
        bind    <ip flotante>:80
        default_backend app_image
    
    backend app_image
        server  app1 <ip nodo1>:3000 check
        server  app2 <ip nodo2>:3000 check

    listen mysql-cluster
        bind 127.0.0.1:3306
        mode tcp
        option mysql-check user haproxy_check
        balance roundrobin
        server mysql-1 <ip servidor bd 1>:3306 check
        server mysql-2 <ip servidor bd 2>:3306 check

    $ sudo vim /etc/sysctl.conf

    net.ipv4.ip_nonlocal_bind=1

    $ wget https://raw.githubusercontent.com/thisismitch/cluster-agents/master/haproxy
    $ chmod +x haproxy
    $ sudo mv haproxy /usr/lib/ocf/resource.d/heartbeat

Los siguientes comandos solo deben ser ejecutados en un nodo

    $ sudo pcs resource create haproxy ocf:heartbeat:haproxy op monitor interval=10s
    $ sudo pcs resource clone haproxy
   
## Configuración de HAproxy público

Se instalaba certbot de Let's Encrypt en el nodo2 del diagrama:

    $ wget https://dl.eff.org/certbot-auto
    $ chmod a+x certbot-auto

Se generaba un nuevo certificado para el dominio el proyecto particular (Proyecto 14):

    $ sudo /root/certbot-auto certonly --cert-path /etc/letsencrypt/archive/st0263.dis.eafit.edu.co --expand -d proyecto14.dis.eafit.edu.co

    $ sudo /root/certbot-auto certonly -d st0263.dis.eafit.edu.co  --expand -d proyecto14.dis.eafit.edu.co
    
Posteriormente se añaden las entradas a la configuracion de HAproxy en /etc/haproxy/haproxy.cfg:

    $ sudo vim /etc/haproxy/haproxy.cfg
    
Se añaden las siguientes entradas:

    bind proyecto14.dis.eafit.edu.co:443    ssl     crt     /etc/haproxy/certs/st0263.pem
    acl host_proyecto14(host) -i proyecto14.dis.eafit.edu.co
    use_backend proyecto14_cluster if host_proyecto14
    backend proyecto14_cluster
        balance leastconn
        option httpclose
        cookie JESSIONID prefix
        server node1 10.131.137.145:80

## Instalacion de la base de datos

    $ sudo yum install mariadb-server
    $ sudo systemctl start mariadb  # iniciar el servicio de base de datos
    $ sudo systemctl enable mariadb  # configurar el servicio para ejecutarce al iniciar la maquina
    $ sudo /usr/bin/mysql_secure_installation  # configuracion final de la base de datos
    $ sudo firewall-cmd --zone=public --add-service=mysql --permanent
    $ sudo firewall-cmd --reload

    $ mysql -u root -p
    mysql> CREATE DATABASE image_manager;
    mysql> CREATE USER '<user>' IDENTIFIED BY '<password>';
    mysql> GRANT ALL ON image_manager.* TO '<user>' IDENTIFIED BY '<password>';

## Configuracion Master-Master para base de datos

    Servidor 1
    $ sudo vim /etc/my.cnf

    server-id=<id>
    log-bin=mysql-bin

    $ sudo systemctl restart mariadb
    $ mysql -u root -p

    mysql> CREATE USER 'haproxy_check';
    mysql> create user '<reply user>'@'%' identified by '<reply password>';
    mysql> grant replication slave on *.* to '<reply user>'@'%';
    mysql> show master status; # guardar file y position

    Servidor 2
    Repetir pasos anteriores, no olvidar cambiar id en /etc/my.cnf

    mysql> slave stop;
    mysql> change master to master_host='<ip_servidor1>', master_user='<reply user>', master_password='<reply password>', master_log_file='<log_file>', master_log_pos=<log_pos>;
    mysql> slave start;
    mysql> show slave status\G; # No deben salir errores

    Servidor 1

    mysql> slave stop;
    mysql> change master to master_host='<ip_servidor2>', master_user='<user>', master_password='<password>', master_log_file='<log_file>', master_log_pos=<log_pos>;
    mysql> slave start;
    mysql> show slave status\G; # No deben salir errores

## Configuracion de NFS
    Servidor:
    $ sudo yum install nfs-utils
    $ sudo mkdir <carpeta_a_compartir>
    $ sudo chown <usuario>.<grupo> <carpeta_a_compartir>
    $ sudo systemctl start rpcbind
    $ sudo systemctl enable rpcbind
    $ sudo systemctl start nfs-server
    $ sudo systemctl enable nfs-server
    $ sudo vim /etc/exports

    /share <ip_red_clientes>/<mascara>(rw,sync,no_root_squash)

    $ sudo exportfs -r
    $ sudo firewall-cmd --zone=public --add-service=mountd --permanent
    $ sudo firewall-cmd --zone=public --add-service=rpc-bind --permanent
    $ sudo firewall-cmd --zone=public --add-service=nfs --permanent
    $ sudo firewall-cmd --reload
    $ showmount -e localhost

    Cliente:

    $ sudo yum install nfs-utils
    $ sudo mkdir <carpeta_compartida>
    $ sudo chown <usuario>.<grupo> <carpeta_a_compartir>
    $ sudo systemctl start rpcbind
    $ sudo systemctl enable rpcbind
    $ sudo mount <ip_servidor>:/<carpeta_a_compartir> <carpeta_compartida> -o bg,soft,timeo=1
    $ sudo vim /etc/fstab

    <ip_servidor>:<carpeta_a_compartir> <carpeta_compartida>    nfs    bg,soft,timeo=1    0 0

Configuracion de sincronizacion de archivos

    Crontab
    $ sudo yum install rsync
    $ sudo vim /etc/crontab

    * * * * * <user> rsync <other_host>:/share/ /sharebk --delete -r
    
    Rc-local
    $ sudo chmod +x /etc/rc.d/rc.local
    $ sudo vim /etc/rc.d/rc.local
    
    su <user> -c "rsync <other_host>:/sharebk/ /share --delete -r"
    
    $ sudo systemctl start rc-local
    $ sudo systemctl enable rc-local

## Configurar la aplicacion

    $ git clone https://github.com/AlejandroSalgadoG/Web.git  # descargar codigo
    $ cd Web/installation
    $ ./install_dependencies.sh
    $ mysql -h 127.0.0.1 -u <user> -p < create_database.sql

    $ sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent
    $ sudo firewall-cmd --reload

## Configuracion de manejador de procesos

    $ sudo npm install pm2 -g
    # generar el servicio que va a ejecutar la aplicacion al encender la maquina
    $ sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u asalgad2 --hp /home/asalgad2
    $ pm2 start app.js
    $ pm2 save
---
## 5. Documentacion de rendimiento

Para el cache se uso el modulo node-cache, el cual guarda objetos en memoria, este fue usado para hacer cache de los
archivos y su docuemntacion puede ser encontrada aqui:

https://www.npmjs.com/package/node-cache

Cada imagen es almacanada en cache cuando se crea y tambien cuando se obtiene a traves de una busqueda, cada imagen 
tiene un TTL de 6 minutos en el cache, adicion a esto cada 2 minutos se verifica si se han tenido HIT's y se extiende 
el tiempo de vida nuevamente, los caches son propios de cada servidor de aplicaciones y por lo tanto se maneja de forma 
independendiente 

## Configuracion del node cache

Primero se instancia el modulo y se configura el TTL y el periodo de verificacion

    const NodeCache = require( "node-cache" );
    const FileCache = new NodeCache( { stdTTL: 360, checkperiod: 120 } );
    
## 6. Documentacion de seguridad

## Configuración de HAproxy público

Se instalaba certbot de Let's Encrypt en el nodo2 del diagrama:

    $ wget https://dl.eff.org/certbot-auto
    $ chmod a+x certbot-auto

Se generaba un nuevo certificado para el dominio el proyecto particular (Proyecto 14):

    $ sudo /root/certbot-auto certonly --cert-path /etc/letsencrypt/archive/st0263.dis.eafit.edu.co --expand -d proyecto14.dis.eafit.edu.co

    $ sudo /root/certbot-auto certonly -d st0263.dis.eafit.edu.co  --expand -d proyecto14.dis.eafit.edu.co
    
Posteriormente se añaden las entradas a la configuracion de HAproxy en /etc/haproxy/haproxy.cfg:

    $ sudo vim /etc/haproxy/haproxy.cfg
    
Se añaden las siguientes entradas:

    bind proyecto14.dis.eafit.edu.co:443    ssl     crt     /etc/haproxy/certs/st0263.pem
    acl host_proyecto14(host) -i proyecto14.dis.eafit.edu.co
    use_backend proyecto14_cluster if host_proyecto14
    backend proyecto14_cluster
        balance leastconn
        option httpclose
        cookie JESSIONID prefix
        server node1 10.131.137.145:80

## Configuracion de firewall

Para la configuracion del firewall ser revisaron los puertos abiertos con el comando:

    $ sudo netstat -atn 
    
Y se verifico que solo estuvieran abiertos los puertos usados por los servidores para la comunicacion entre ellos.

## Autorizacion con Passport.js y LocalStrategy

Se implemento una solución con Passport.js a traves de dos Named Local Strategies, 
una para el Log In ('local-login') y para el Register ('local-signup') que hacian de middleware
para el HTTP Request, validando la creacion y la autenticacion de los usuarios usando Passport.js.
En caso de fallar la autenticacion, se redirige al usuario al home ('/'), en caso de autenticarse
correctamente, el usuario es autenticado via cookie:

    
    app.post('/login', passport.authenticate('local-login', {
        failureRedirect : '/',
    }), function(req, res) {
        var user = req.body.user;
        res.cookie('user', user);
        res.render('logged', { user:user, search:{}, msg:"" });
    });

    app.post('/register', passport.authenticate('local-signup', {
		failureRedirect : '/',
    }), function(req, res){
        var user = req.body.user;
        res.cookie('user', user);
        res.render('home', { msg:"The user has been created" });
    });
    
Para la autorizacion, se implemento un metodo como middleware que valida cada HTTP Request hecho
a cada uno de los recursos del servidor:

    function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
    }

La funcion es refernciada en cada una de las rutas. 
En caso de fallar, redirecciona al usuario hacia el home ('/'), en caso de exito,
el servidor permite el acceso al recurso.

    app.get('/', routes.home);
    app.get('/logout', isLoggedIn, routes.logout);
    app.get('/read_users', routes.read_users);
    app.get('/manage_account', isLoggedIn, routes.manage_account);
    app.get('/search_images_by_name', isLoggedIn, routes.search_images_by_name);
    app.get('/search_images_by_type', isLoggedIn, routes.search_images_by_type);

    app.post('/delete_user', isLoggedIn, routes.delete_user);
    app.post('/update_password', isLoggedIn, routes.update_password);
    app.post('/create_image', isLoggedIn, routes.create_image);
    app.post('/update_image', isLoggedIn, routes.update_image);
    app.post('/share_image', isLoggedIn, routes.share_image);
    app.post('/delete_image', isLoggedIn, routes.delete_image);  
    
