import { routeMeta, getMatchedComponents, normalizePath, hasOwn } from '../../utils';
import { useNuxtApp, defineNuxtRouteMiddleware } from '#imports';

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Disable middleware if options: { auth: false } is set on the route
    if (Object.hasOwn(to.meta, 'auth') && routeMeta(to, 'auth', false)) {
        return;
    }

    // Disable middleware if no route was matched to allow 404/error page
    const matches: unknown[] = [];
    const Components = getMatchedComponents(to, matches);

    if (!Components.length) {
        return;
    }

    const ctx = useNuxtApp();

    const { login, callback } = ctx.$auth.options.redirect;

    const pageIsInGuestMode = hasOwn(to.meta, 'auth') && routeMeta(to, 'auth', 'guest');

    const insidePage = (page: string) => normalizePath(to.path) === normalizePath(page);

    if (ctx.$auth.$state.loggedIn) {
        // Perform scheme checks.
        const { tokenExpired, refreshTokenExpired, isRefreshable } = ctx.$auth.check(true);

        // Refresh token has expired. There is no way to refresh. Force reset.
        if (refreshTokenExpired) {
            ctx.$auth.reset();
        } else if (tokenExpired) {
            // Token has expired. Check if refresh token is available.
            if (isRefreshable) {
                // Refresh token is available. Attempt refresh.
                try {
                    await ctx.$auth.refreshTokens();
                } catch (error) {
                    // Reset when refresh was not successfull
                    ctx.$auth.reset();
                }
            } else {
                // Refresh token is not available. Force reset.
                ctx.$auth.reset();
            }
        }

        // -- Authorized --
        if (!login || insidePage(login) || pageIsInGuestMode) {
            return ctx.$auth.redirect('home', to);
        }
    }

    // -- Guest --
    // (Those passing `callback` at runtime need to mark their callback component
    // with `auth: false` to avoid an unnecessary redirect from callback to login)
    else if (!pageIsInGuestMode && (!callback || !insidePage(callback))) {
        return ctx.$auth.redirect('login', to);
    }
});
