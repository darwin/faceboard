(ns faceboard.model
  (:refer-clojure :exclude [get set update inc dec])
  (:require [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.helpers.utils :refer [json->model]]))

(defn update
  ([state path fn] (update-in state path fn))
  ([path fn] (update @app-state path fn)))

(defn toggle
  ([state path] (update-in state path #(not %)))
  ([path] (toggle @app-state path)))

(defn disable
  ([state path] (assoc-in state path false))
  ([path] (disable @app-state path)))

(defn enable
  ([state path] (assoc-in state path true))
  ([path] (disable @app-state path)))

(defn set
  ([state path value] (assoc-in state path value))
  ([path value] (set @app-state path value)))

(defn get
  ([state path] (get-in state path))
  ([path] (get @app-state path)))

(defn inc
  ([state path] (update state path cljs.core/inc))
  ([path] (update @app-state path cljs.core/inc)))

(defn dec
  ([state path] (update state path cljs.core/dec))
  ([path] (update @app-state path cljs.core/dec)))

(defn dec-if-pos [n]
  (if (pos? n)
    (cljs.core/dec n)
    n))

(defn dec-clamp-zero
  ([state path] (update state path dec-if-pos))
  ([path] (update @app-state path dec-if-pos)))
