export function addStyle() {
    const styleElemenet = `
        <style>
            #annict {
                position: relative;
            }
            #annict > div {
                display: flex;
                width: 100%;
                height: 100%;
                justify-content: center;
                align-items: center;
                background: #f85a72;
            }
            #annict > div:hover {
                background: #f97388 !important;
            }
            #annict > div > span {
                padding: 1px 7px 0 7px;
                user-select: none;
            }
            .dropdown-menu.show {
                display: block;
            }
            .dropdown-menu {
                position: absolute;
                width: 100%;
                inset: 0px auto auto 0px;
                z-index: 1000;
                display: none;
                min-width: 10rem;
                padding: .5rem 0;
                margin: 0;
                font-size: 1rem;
                color: #212529;
                text-align: left;
                list-style: none;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid rgba(0, 0, 0, .15);
                border-radius: .3rem;
                transform: translate(0px, 45px);
            }
            li:last-child > .dropdown-item {
                padding-left:0 !important;
                padding-right:0 !important;
                text-align: center;
                text-decoration: none;
            }
            li:not(:last-child) > .dropdown-item:hover {
                color: #1e2125;
                background-color: #e9ecef;
            }
            .dropdown-item {
                display: block;
                width: 100%;
                padding: .5rem 1rem;
                clear: both;
                font-weight: 400;
                color: #212529;
                text-align: inherit;
                white-space: nowrap;
                background-color: transparent;
                border: 0;
                font-size: 16px;
                cursor: pointer;
            }
            .dropdown-item>svg {
                margin-right: 1rem !important;
            }
            .dropdown-svg {
                width: 1em;
            }
            .record-container {
                position: absolute;
                bottom: 0;
                right: 0;
                min-height: 22px;
                padding: 1%;
                display: flex;
            }
            .record-button {
                display: none;
                border: 1px solid;
                border-radius: 3px;
                white-space: nowrap;
                margin-right: .4em;
                color: #5b5b5b;
                cursor: pointer;
                transition: .15s ease-in-out;
            }
            .record-button:hover {
                background-color: white;
            }
            .record-button:active {
                background-color: #94f0ff;
            }
            .record-svg {
                pointer-events: none;
                width: 0.875em;
            }
            .record-container:hover .record-button {
                display: block;
            }
            .next-episode-border {
                margin-bottom: 6px !important;
            }
            .next-episode-border > section > a.clearfix {
                border: 2px solid rgb(248, 90, 114) !important;
            }
            #upload-icon-container {
                text-align: center;
            }
            #upload-icon-container:hover > #upload-icon {
                opacity: 1;
            }
            #upload-icon {
                position: absolute;
                top: 50%; transform:
                translate(-50%, -50%);
                opacity: .6;
            }
            #upload-anime-title {
                display: table;
                transition: .5s
            }
            #upload-anime-title > span {
                display: table-cell;
                color: #a0a09f;
                font-weight: 700;
                vertical-align: middle;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styleElemenet);
}