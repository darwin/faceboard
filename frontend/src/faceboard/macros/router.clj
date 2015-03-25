(ns faceboard.macros.router)

(defmacro defroute-with-info [fn-name route destruct & body]
  (def resolved-fn-name (gensym))
  `(do
     (def ^:dynamic ~resolved-fn-name)
     (set! ~resolved-fn-name (secretary.core/defroute
                               ~route
                               {:as params#}
                               (set! faceboard.router/*current-route-info* {:params params#
                                                                            :name '~fn-name
                                                                            :route  ~resolved-fn-name})
                               (let [{:keys ~destruct} params#] ~@body)))
     (set! faceboard.router/*routes* (assoc faceboard.router/*routes* '~fn-name ~resolved-fn-name))))