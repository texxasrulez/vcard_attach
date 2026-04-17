(function ($) {
    function isDebugEnabled() {
        return !!(window.rcmail && rcmail.env && rcmail.env.vcard_attach_skin_runtime_patch_debug);
    }

    function debugLog(message, data) {
        if (!isDebugEnabled() || !window.console || !console.log) {
            return;
        }

        if (typeof data === 'undefined') {
            console.log('[vcard_attach]', message);
        } else {
            console.log('[vcard_attach]', message, data);
        }
    }

    function eachIframeDocument(callback) {
        document.querySelectorAll('iframe').forEach(function (frame) {
            try {
                if (frame.contentDocument) {
                    callback(frame.contentDocument, frame);
                }
            } catch (e) {
                // Ignore cross-origin iframe access failures.
            }
        });
    }

    function injectStyle(doc) {
        if (!doc || !doc.head) {
            return;
        }

        var styleId = 'vcard-attach-runtime-style';
        var style = doc.getElementById(styleId);
        var css = '' +
            '.vcardattachment, p.vcardattachment, .vcardattachment.aligned-buttons.boxinformation {' +
            'background:var(--vcard-attach-panel-bg, transparent) !important;' +
            'background-color:var(--vcard-attach-panel-bg, transparent) !important;' +
            'background-image:none !important;' +
            'color:var(--vcard-attach-panel-text, inherit) !important;' +
            'border:1px solid var(--vcard-attach-border, currentColor) !important;' +
            'display:inline-flex !important;' +
            'align-items:center !important;' +
            'gap:.4em !important;' +
            'width:auto !important;' +
            'max-width:100% !important;' +
            '}' +
            '.vcardattachment span, .vcardattachment a {' +
            'color:var(--vcard-attach-panel-text, inherit) !important;' +
            '}';

        if (!style) {
            style = doc.createElement('style');
            style.id = styleId;
            style.type = 'text/css';
            doc.head.appendChild(style);
        }

        if (style.textContent !== css) {
            style.textContent = css;
            debugLog('Updated runtime style in document', {
                title: doc.title || '(no title)',
                panelCount: doc.querySelectorAll('.vcardattachment').length
            });
        }
    }

    function applyVcardAttachmentSkin() {
        injectStyle(document);
        eachIframeDocument(function (doc) {
            injectStyle(doc);
        });

        debugLog('Applied runtime skin patch', {
            href: window.location.href,
            stylesheets: Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]')).map(function (link) {
                return link.getAttribute('href') || '';
            }).filter(function (href) {
                return href.indexOf('vcard_attach.css') !== -1;
            })
        });
    }

    $(document).ready(function () {
        applyVcardAttachmentSkin();

        // Message preview content can be re-rendered after navigation, so reapply styles on DOM updates.
        var observer = new MutationObserver(function () {
            applyVcardAttachmentSkin();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        document.querySelectorAll('iframe').forEach(function (frame) {
            frame.addEventListener('load', function () {
                applyVcardAttachmentSkin();
            });
        });

        window.setTimeout(function () {
            applyVcardAttachmentSkin();
        }, 1200);
    });
})(jQuery);
