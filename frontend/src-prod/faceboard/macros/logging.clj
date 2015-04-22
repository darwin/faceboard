(ns faceboard.macros.logging)

(defmacro log [& _])                                        ; do not leak ordinary logs into production

(defmacro log-info [& args]
  `(.info js/console ~@args))

(defmacro log-err [& args]
  `(.error js/console ~@args))

(defmacro log-warn [& args]
  `(.warn js/console ~@args))