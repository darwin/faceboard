(ns faceboard.macros.model)

(defmacro transform-app-state [& forms]
  `(reset! faceboard.state/app-state (-> (deref faceboard.state/app-state) ~@forms)))