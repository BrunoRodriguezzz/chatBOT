Sistemas operativos

**Contenido**

- [**Primer parcial**](#primer-parcial)
  - [**Repaso arquitectura**](#repaso-arquitectura)
    - [**Registros**](#registros)
    - [**Ciclo de instrucción**](#ciclo-de-instrucción)
    - [**Interrupción**](#interrupción)
    - [**Mecanismos de I/O**](#mecanismos-de-io)
    - [**Sistema operativo**](#sistema-operativo)
    - [**Modos de ejecución**](#modos-de-ejecución)
    - [**Tipos de Kernel**](#tipos-de-kernel)
  - [**Procesos e Hilos**](#procesos-e-hilos)
    - [**Estados y planificación**](#estados-y-planificación)
      - [**Algoritmos de planificación a corto plazo**](#algoritmos-de-planificación-a-corto-plazo)
    - [**Procesos hijos**](#procesos-hijos)
    - [**Comunicación entre procesos**](#comunicación-entre-procesos)


# **Primer parcial**

## **Repaso arquitectura**

### **Registros**

- Instruction Register (IR): Almacena la instrucción que se está ejecutando
- Acumulador (AC): Almacena temporalmente resultados intermedios que trata la ALU.
- Program Counter (PC): Indica la posición donde está la CPU en su secuencia de instrucciones.
- PSW: Contiene flags que representan el estado de las operaciones.

### **Ciclo de instrucción**

- Fetch: Busqueda de la instrucción.
- Decode.
- Execute: Pueden darse errores o excepciones.
- Procesar interrupciones: Se suelen ejecutar al final, si es que están habilitadas.
  - El procesador identifica quien la originó y lo notifica.
  - El procesador introduce el PSW y el PC en la pila del sistema.

### **Interrupción**

Son señales que indican al CPU que hay un evento que requieren de atención. Pueden ser enmascarables (ignorables).

- Interrupciones sincrónicas: Excepciones, errores que se dan **en ejecución**.
- Interrupciones asíncronas: Dispositivo externo a la CPU

**Cambios de contexto**: Cuando se produce una interrupción debemos guardar los datos del proceso para después continuar con la ejecución de este. Se guardan los registros que vayan a ser modificados:

- PC
- PSW
- Registros

### **Mecanismos de I/O**

Hay varias formas:

- Cada ciclo del procesador (que es bastante más rápido que los de I/O) comprueba constantemente si el I/O ya tiene los datos listos (un pull based). Esto se hace por palabras del procesador, es decir por "pedacitos".
- Se dispara una operación de lectura, pero en este caso el dispositivo de I/O es el que se encargar de avisar (mediante una interrupción) que termino (un push based), la ventaja es que la CPU no tiene que estar constantemente preguntando y puede hacer otras cosas mientras. Luego es la CPU la que tiene que copiar y guardar los datos.
- Es lo mismo que el método 2, pero en este caso se cuenta con DMA (Direct Memory Access) que es un componente dedicado a esta operación, por lo que la CPU le delega la tarea de copiar y guardar a este chip. **El mejor**.

### **Sistema operativo**

Un sistema operativo debería:

- Administrar la ejecución del programa
- Comunicación entre programas.
- Ser interfaz de usuario.
- Administrar memoria y archivos.
- Administrar los dispositivos I/O.

Componentes:

- Kernel: Es el núcleo de SO y administra los recursos y los "disponibiliza". Monopoliza el acceso a los recursos.
- **Syscalls**: Son funciones que nos permiten acceder a los recursos del kernel (por ejemplo, send() y recv()).
  - También existen los **wrappers** que son funciones que ejecutan esa misma syscall, pero nos brindan:
    - Portabilidad: Las syscalls cambian con cada SO, pero el wrapper es el mismo (ejecutaran un syscall diferente para cada SO).
    - Abstraen complejidad en su uso: Muchas syscalls tienen varios parámetros y son complicadas de usar.

**Instrucciones privilegiadas**: Son instrucciones que solo puede realizar el kernel, por ejemplo, modificar un espacio de memoria.

CLI: Es una instrucción assemble para deshabilitar las interrupciones.

### **Modos de ejecución**

Lo podemos conocer con el PSW.

- Modo usuario: Actúa sobre los registros propios de la aplicación.
- Modo kernel: Permite acceder a cosas propias del kernel, por ejemplo, escribir un archivo.

_Usuario 🡪 Kernel: Interrupción o syscall_

_Kernel 🡪 Usuario: Cuando se restaura el contexto_

### **Tipos de Kernel**

- Monolítico: Un kernel que se encarga de todas las funciones. Estos son los que se utilizan hoy en día.
- Microkernel: Usa un kernel reducido con funciones más básicas, se enfoca en que sea modular. Como hay más cambios de modo y contexto, se produce mas overhead y es mas fácil romperlo. Ventajas:
  - Robustez: Si se rompe algo es más probable que sea en espacio de usuario, lo que es mejor.
  - Facilidad de intercambiar un módulo con otro.
- Multicapa: Es más un ejemplo didáctico, es como un microkernel pero con más capas lo que genera más cambios de estado.
- Kernel híbrido: Es un kernel más grande que el microkernel, pero que mantiene algunas funcionalidades en la capa de usuario.

## **Procesos e Hilos**

**Proceso**: Es un programa en ejecución. Se suele decir que el programa es la entidad pasiva y el proceso la activa.

**PCB**: Es donde se almacenan todas las referencias de los datos de los procesos, su estructura administrativa. Siempre esta cargado en la RAM. Es el punto de entrada a la información del proceso y una estructura que usa el kernel. Posee:

- PID: que es el ID.
- Estado del proceso.
- PC.
- Registros de la CPU.
- Información de planificación: Información administrativa.
- Información de gestión de memoria.
- Información contable.
- Información de estado de E/S.
- Punteros.

Segmentos:

- Código: Son las instrucciones por ejecutar.
- Datos: Variables, constantes globales. La memoria estática.
- HEAP: Es la reserva de memoria dinámica. Es un segmento que crece y decrece.
- STACK: Tiene las variables locales y los retornos de las funciones.

**Concurrencia**: Tener diferentes procesos y de alguna manera turnarlos. Da la impresión de que están ocurriendo al mismo tiempo.

**Paralelismo**: Hacer dos cosas realmente al mismo tiempo. Atender más de una instrucción al mismo tiempo.

### **Estados y planificación**

**Swapping**: Nos da la probabilidad de pasar toda la información en memoria RAM a disco (salvo el PCB). Esto lo hacemos para aprovechar más la RAM.

**Planificadores**: Tenemos más de un planificador:

- Extralargo plazo: El usuario/administrador que decide finalizar un proceso.
- Largo plazo: Determina los procesos que pasas a ready. Buscará tener un balance entre procesos CPU Bound y I/O Bound. Esto afecta al grado de multiprogramación.
- Mediano plazo: Se encarga de suspender procesos, llevarlos y traerlos a swap. Esto también afecta al grado de multiprogramación.
- Corto plazo: Se encarga de determinar que proceso ejecuta la CPU. Es el que se ejecuta con mayor frecuencia que el resto, por lo que sus decisiones deben ser buenas y el overhead debe ser mínimo.
  - Si tiene desalojo hay más overhead.

Cuando se cambia el proceso que posee la CPU se debe guardar su contexto de ejecución para luego poder reanudarlo. Este cambio tiene como objetivo:

- Ejecutar otro proceso.
- Atender una Interrupción.
- Ejecutar una syscall.

El tiempo que tarda en hacer un cambio de contexto es tiempo perdido en el que el CPU no hace nada para el usuario. Se considera Overhead.

- 1 cambio de proceso → 2 Cambios de contexto (en el medio está el SO, entonces pasa del P1 al SO y de ahí pasa al P2)
- 2 cambios de contexto no siempre implican 1 cambio de proceso (Se puede ejecutar un syscall o atender una interrupción)
- 1 cambio de modo siempre implica un cambio de contexto (paso de ejecutar u proceso de usuario a ejecutar el SO o viceversa)
- 1 cambio de contexto no implica que siempre haya un cambio de modo (interrupciones anidadas).

Métricas: Nos dicen que algoritmo nos conviene usar:

- Orientados al usuario
  - Tiempo de respuesta.
  - Predictibilidad: Debería cumplir con los tiempos establecidos, por ejemplo. (Iniciar la cpu siempre tarda más o menos lo mismo)
  - Cumplimiento de deadlines.
- Orientados al sistema
  - Utilización de la CPU.
  - Throughput: Cantidad de procesos terminados en cierto tiempo tiempo
  - Respetar las prioridades.
  - Utilización de recursos.
  - Tiempo de espera: Cuanto tiempo esta u proceso esperando a ser ejecutado.
  - Tiempo de ejecución

#### **Algoritmos de planificación a corto plazo**

- FIFO: Atendemos los procesos en orden de llegada. Es el más simple.
  - Muy poco overhead.
  - No respeta mucho las métricas anteriores
- SJF: Va a priorizar aquellos procesos con ráfagas de CPU menores.
  - Al trabajar con desalojo tenemos en cuenta el tiempo restante. Al SJF con desalojo se le dice SRT.
  - Sufre de starvation/inanición ya que puede pasar que un proceso no se ejecute nunca si llegan procesos con ráfagas menores.
  - Es el óptimo para reducir el tiempo de espera.
  - Se trabaja con estimaciones puesto que no se puede saber cuanto va a ejecutar.
    - : Es la estimación.
    - : Es lo que realmente ejecuto.
    - : Es un valor que nosotros asignamos, suele ser 0,5.
- HRRN: Es una adaptación del SJF que permite romper con la inanición usando aging. Se cambia la formula:

  - 1. : Tiempo de espera en READY.
    - : Duración próxima ráfaga.

  - Este método provoca mucho mas overhead, por lo que siempre se ve sin desalojo.
- Prioridades: Se asigna una prioridad a cada proceso (puede ser un número que le demos o por ejemplo alguna métrica como la ráfaga de CPU (SJF)) y se ejecuta el proceso con la prioridad más alta (número pequeño 🡪 prioridad alta).
  - También sufre de inanición, que puede solucionarse con aging (envejecimiento).
- Round Robin (RR): Cada proceso obtiene la CPU por una cantidad de tiempo máxima que se llama **quantum**. De esta forma los procesos no pueden monopolizar la CPU.
  - Es siempre con desalojo, cuando pasa el tiempo se lanza una interrupción de tiempo (interrupción asincrónica, lanzada por un timer) y el proceso es expropiado e insertado al final de la cola de listos.
  - Esto no minimiza el tiempo de espera, pero si lo hace más previsible (sabiendo cuantos procesos hay delante, puedo calcular cuanto puede tardar como mucho en ejecutar).
  - Es importante determinar un quantum que:
    - No sea demasiado grande (quedaría como un FIFO).
    - No sea demasiado chico (generaría mucho overhead).
- Virtual Round Robin (VRR): La idea es la misma que el Round Robin, pero en este caso se busca que los procesos puedan aprovechar la totalidad de su quantum. Se cuenta con una cola de READY extra y cuando un proceso lo bloquea y vuelve a READY, va a esta nueva cola con el quantum restante.
  - No puede ocurrir inanición porque al final termina ejecutando el mismo quantum.
  - Que la otra cola sea prioritaria significa que va a ser siempre la primera que se procese.
  - Es un algoritmo multinivel retroalimentado.
- Colas multinivel: Es una combinación de distintas con prioridad.
  - Cada cola tiene su propio algoritmo.
  - Puede haber desalojo en las colas o entre colas.
- Colas multinivel retroalimentadas (feedback): Es como las colas multinivel pero en este caso se establece un criterio para que esos procesos puedan ir cambiando de colas, ya sea subiendo o bajando. Debemos tener en cuenta:
  - El número de colas.
  - El algoritmo de planificación de cada cola.
  - A que cola llegaran los procesos nuevos.
  - Criterio para pasar de una cola a la otra.
  - Si hay desalojo entre colas.

### **Procesos hijos**

Podemos crear procesos hijos usando "fork()", cuando lo hacemos tenemos un proceso que es igual al anterior salvo por el PID.

- Procesos huérfanos: Son aquellos procesos por los cuales sus padres no los esperaron. En algunos casos el SO los elimina o los "adopta" el abuelo.
- Procesos zombis: Aquellos procesos huérfanos de los cuales nadie se ocupó. Esto hace que el proceso quede en memoria de forma reducida siempre.

### **Comunicación entre procesos**

- Memoria compartida: Establecen una zona de memoria compartida en la cual leen y escriben datos para comunicarse.
  - Permite una comunicación más rápida.
  - Una vez establecida la región compartida no se requiere intervención del SO.
- Paso de mensajes: Es útil para intercambiar pequeñas cantidades de datos. Es más lento ya que requiere cambios de contexto.