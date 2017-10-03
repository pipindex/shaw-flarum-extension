<?php

ini_set('display_errors', 'On');

use Flarum\Event\ConfigureClientView;
use Illuminate\Contracts\Events\Dispatcher;

return function (Dispatcher $events) {

    $events->listen(ConfigureClientView::class, function (ConfigureClientView $event) {
        if ($event->isForum()) {
            $event->addAssets([
                __DIR__ . '/js/forum/dist/extension.js',
                __DIR__ . '/less/forum/extension.less',
            ]);
            $event->addBootstrapper('pipindex/shawTheme/main');
        }
    });
};