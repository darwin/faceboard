(ns faceboard.logging)

(defn- log-method [method & args]
  (.apply (aget js/console method) js/console (into-array args)))

(defn log [& _]) ; no-op in production mode

(defn log-info [& args]
  (apply log-method (cons "info" args)))

(defn log-err [& args]
  (apply log-method (cons "error" args)))

(defn log-warn [& args]
  (apply log-method (cons "warn" args)))