(ns faceboard.macros.logging)

(defmacro log [& args]
  `(.log js/console ~@args))

(defmacro log-info [& args]
  `(.info js/console ~@args))

(defmacro log-err [& args]
  `(.error js/console ~@args))

(defmacro log-warn [& args]
  `(.warn js/console ~@args))