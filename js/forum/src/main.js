import { extend } from 'flarum/extend';
import app from 'flarum/app';
import Post from 'flarum/components/Post';
import Component from 'flarum/Component';
import Page from 'flarum/components/Page';
import TerminalPost from 'flarum/components/TerminalPost';
import HeaderSecondary from 'flarum/components/HeaderSecondary';
import HeaderPrimary from 'flarum/components/HeaderPrimary';
import SessionDropdown from 'flarum/components/SessionDropdown';
import Dropdown from 'flarum/components/Dropdown';
import DiscussionControls from 'flarum/utils/DiscussionControls';
import DiscussionListItem from 'flarum/components/DiscussionListItem';
import IndexPage from 'flarum/components/IndexPage';
import listItems from 'flarum/helpers/listItems';
import ItemList from 'flarum/utils/ItemList';
import Button from 'flarum/components/Button';
import highlight from 'flarum/helpers/highlight';
import LinkButton from 'flarum/components/LinkButton';
import extractText from 'flarum/utils/extractText';
import abbreviateNumber from 'flarum/utils/abbreviateNumber';
import SelectDropdown from 'flarum/components/SelectDropdown';
import tagLabel from 'flarum/tags/helpers/tagLabel';
import TagsPage from 'flarum/tags/components/TagsPage';
import humanTime from 'flarum/helpers/humanTime';
import icon from 'flarum/helpers/icon';
import avatar from 'flarum/helpers/avatar';
import username from 'flarum/helpers/username';
import tagsLabel from 'flarum/tags/helpers/tagsLabel';
import sortTags from 'flarum/tags/utils/sortTags';
import { truncate } from 'flarum/utils/string';
import listInline from 'pipindex/shaw-flarum-extension/listInline';



app.initializers.add('pipindex/shaw-flarum-extension', app => {




    SessionDropdown.prototype.getButtonContent = function() {
        const user = app.session.user;
        const attrs = {};
        attrs.style = {background: '#000'};
        return [
            <span className="Button-label">{username(user)}</span>,
            avatar(user), ' '
        ];
    };

    IndexPage.prototype.viewItems = function(){
        const items = new ItemList();
        const sortMap = app.cache.discussionList.sortMap();

        const sortOptions = {};
        for (const i in sortMap) {
            sortOptions[i] = app.translator.trans('core.forum.index_sort.' + i + '_button');
        }
        
        items.add('sort',
        listInline.component({
                buttonClassName: 'Button',
                label: sortOptions[this.params().sort] || Object.keys(sortMap).map(key => sortOptions[key])[0],
                children: Object.keys(sortOptions).map(value => {
                    const label = sortOptions[value];
                    const active = (this.params().sort || Object.keys(sortMap)[0]) === value;

                    return Button.component({
                        className: 'Button',
                        children: label,
                        icon: active ? 'check' : true,
                        onclick: this.changeSort.bind(this, value),
                        active: active,
                    })
                }),
            })

        );

        return items;
    };

    IndexPage.prototype.sidebarItems = function() {
        const items = new ItemList();
        const canStartDiscussion = app.forum.attribute('canStartDiscussion') || !app.session.user;

        items.add('newDiscussion',
            Button.component({
                children: app.translator.trans(canStartDiscussion ? 'core.forum.index.start_discussion_button' : 'core.forum.index.cannot_start_discussion_button'),
                icon: 'edit',
                className: 'Button Button--primary IndexPage-newDiscussion',
                itemClassName: 'App-primaryControl',
                onclick: this.newDiscussion.bind(this),
                disabled: !canStartDiscussion
            })
        );

        items.add('nav',
            SelectDropdown.component({
                children: this.navItems(this).toArray(),
                buttonClassName: 'Button',
                className: 'App-titleControl'
            })
        );
        return items;
    };

    TagsPage.prototype.view = function() {
        const pinned = this.tags.filter(tag => tag.position() !== null);
        const cloud = this.tags.filter(tag => tag.position() === null);

        return (
            <div className="TagsPage">
                {IndexPage.prototype.hero()}
                <div className="container">
                    <nav className="TagsPage-nav IndexPage-nav sideNav" config={IndexPage.prototype.affixSidebar}>
                        <ul>{listItems(IndexPage.prototype.sidebarItems().toArray())}</ul>
                    </nav>

                    <div className="TagsPage-content sideNavOffset">
                        <ul className="TagTiles">
                            {pinned.map(tag => {
                                const lastDiscussion = tag.lastDiscussion();
                                const children = sortTags(app.store.all('tags').filter(child => child.parent() === tag));
                                return (

                                    <li className={'TagTile bgImg ' +tag.data.attributes.slug+ (tag.color() ? ' colored' : '')}
                                        style={{backgroundColor: tag.color()}}>
                                        <a className="TagTile-info" href={app.route.tag(tag)} config={m.route}>
                                            <h3 className="TagTile-name">{tag.name()}</h3>
                                            <p className="TagTile-description">{tag.description()}</p>
                                            {children
                                                ? (
                                                    <div className="TagTile-children">
                                                        {children.map(child => [
                                                            <a href={app.route.tag(child)} config={function(element, isInitialized) {
                                                                if (isInitialized) return;
                                                                $(element).on('click', e => e.stopPropagation());
                                                                m.route.apply(this, arguments);
                                                            }}>
                                                                {child.name()}
                                                            </a>,
                                                            ' '
                                                        ])}
                                                    </div>
                                                ) : ''}
                                        </a>
                                        {lastDiscussion
                                            ? (
                                                <a className="TagTile-lastDiscussion"
                                                   href={app.route.discussion(lastDiscussion, lastDiscussion.lastPostNumber())}
                                                   config={m.route}>
                                                    <span className="TagTile-lastDiscussion-title">{lastDiscussion.title()}</span>
                                                    {humanTime(lastDiscussion.lastTime())}
                                                </a>
                                            ) : (
                                                <span className="TagTile-lastDiscussion"/>
                                            )}
                                    </li>
                                );
                            })}
                        </ul>

                        {cloud.length ? (
                            <div className="TagCloud">
                                {cloud.map(tag => {
                                    const color = tag.color();

                                    return [
                                        tagLabel(tag, {link: true}),
                                        ' '
                                    ];
                                })}
                            </div>
                        ) : ''}
                    </div>
                </div>
            </div>
        );
    };

    IndexPage.prototype.view = function() {
        return (
            <div className="IndexPage">
                <div className="row fakeHeaderNav">
                    <div className="container">
                    <ul className="IndexPage-toolbar-view">{listItems(this.viewItems().toArray())}</ul>
                    </div>
                </div>
                <div className="container">
                    <nav className="IndexPage-nav sideNav">
                        <ul>{listItems(this.sidebarItems().toArray())}</ul>
                    </nav>
                    <div className="IndexPage-results sideNavOffset">
                        {app.cache.discussionList.render()}
                    </div>
                </div>
            </div>
        );
    };

    HeaderSecondary.prototype.view = function() {
        return (
            <ul className="Header-controls">
            {listItems(this.items().toArray())}
            </ul>
        );
    }


    DiscussionListItem.prototype.view = function () {
            const retain = this.subtree.retain();

            if (retain) return retain;
            const discussion = this.props.discussion;
            const startPost = discussion.startPost();
            const excerpt = <span>{truncate(startPost.contentPlain(), 200)}</span>;
            const startUser = discussion.startUser();
            const isUnread = discussion.isUnread();
            const isRead = discussion.isRead();
            const showUnread = !this.showRepliesCount() && isUnread;
            const jumpTo = Math.min(discussion.lastPostNumber(), (discussion.readNumber() || 0) + 1);
            const relevantPosts = this.props.params.q ? discussion.relevantPosts() : [];
            const controls = DiscussionControls.controls(discussion, this).toArray();
            const attrs = this.attrs();
            const lastPost = !this.showStartPost();
            const user = discussion[lastPost ? 'lastUser' : 'startUser']();
            const time = discussion[lastPost ? 'lastTime' : 'startTime']();
            const tags = this.props.discussion.tags();

            //console.log(discussion);
            return (
                <div {...attrs}>
                    <a className={'Slidable-underneath Slidable-underneath--left Slidable-underneath--elastic' + (isUnread ? '' : ' disabled')}
                        onclick={this.markAsRead.bind(this)}>
                        {icon('check')}
                    </a>

                        <div className={'DiscussionListItem-content Slidable-content' + (isUnread ? ' unread' : '') + (isRead ? ' read' : '')}>
                            <ul className="DiscussionListItem-badges badges">
                            {listItems(discussion.badges().toArray())}
                            </ul>
                            <a href={startUser ? app.route.user(startUser) : '#'}
                                className="DiscussionListItem-author"
                                title={extractText(app.translator.trans('core.forum.discussion_list.started_text', {user: startUser, ago: humanTime(discussion.startTime())}))}
                                config={function(element) {
                                        $(element).tooltip({placement: 'right'});
                                        m.route.apply(this, arguments);
                                    }}>{avatar(startUser, {title: ''})}</a>
                            <p className="postedBy">Posted by {startUser.data.attributes.displayName}</p>
                            <a href={app.route.discussion(discussion, jumpTo)}
                            config={m.route}
                            className="DiscussionListItem-main">
                                <h3 className="DiscussionListItem-title">{highlight(discussion.title(), this.props.params.q)}</h3>
                            </a>
                            <p className="ListDiscussion-excerpt">{excerpt} <a href={app.route.discussion(discussion, jumpTo)}>(more)</a></p>
                            {relevantPosts && relevantPosts.length
                                ? <div className="DiscussionListItem-relevantPosts">
                                {relevantPosts.map(post => PostPreview.component({post, highlight: this.props.params.q}))}
                            </div>
                            : ''}

                         </div>
                        <div className="row DiscussionListItem-bottomMeta">
                            <span className="DiscussionListItem-count"
                                onclick={this.markAsRead.bind(this)}
                                title={showUnread ? app.translator.trans('core.forum.discussion_list.mark_as_read_tooltip') : ''}>
                                {abbreviateNumber(discussion[showUnread ? 'unreadCount' : 'repliesCount']())} answers | last updated {humanTime(time)}
                            </span> &nbsp;
                                <span className="tags">{tagsLabel(tags)} </span>
                                {controls.length ? Dropdown.component({
                                    icon: 'ellipsis-h',
                                    children: controls,
                                    className: 'DiscussionListItem-controls',
                                    buttonClassName: 'Button Button--icon Button--flat Slidable-underneath Slidable-underneath--right'
                                }) : ''}
                        </div>
                    </div>
        );
    }
});
