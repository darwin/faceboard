(ns faceboard.helpers.underscore)

; taken from https://gist.github.com/rodnaph/5442631
(defn debounce
  ([f] (debounce f 1000))
  ([f timeout]
   (let [id (atom nil)]
     (fn [evt]
       (if (not (nil? @id))
         (js/clearTimeout @id))
       (reset! id (js/setTimeout
                    (partial f evt)
                    timeout))))))

; taken from https://gist.github.com/rodnaph/5442631
(defn throttle [func wait]
  (let [result (atom nil)
        throttling (atom nil)
        more (atom nil)
        timeout (atom nil)
        when-done (debounce (fn []
                              (reset! more false)
                              (reset! throttling false)) wait)]
    (fn []
      (this-as this
        (let [context this
              args js/arguments
              later (fn []
                      (reset! timeout nil)
                      (when @more (.apply func context args))
                      (when-done))]
          (when-not @timeout
            (reset! timeout (js/setTimeout later wait)))
          (if @throttling
            (reset! more true)
            (reset! result (.apply func context args)))
          (when-done)
          (reset! throttling true)
          @result)))))