(ns faceboard.macros.router)

(defmacro defroute-with-info [fn-name route destruct & body]
  (def resolved-fn-name (gensym))
  `(do
     (def ^:dynamic ~resolved-fn-name)
     (secretary.core/defroute
       ~fn-name
       ~route
       {:as params#}
       (set! faceboard.router/*current-route-info* {:params params#
                                                    :route  ~resolved-fn-name})
       (let [{:keys ~destruct} params#] ~@body))
     (set! ~resolved-fn-name ~fn-name)))