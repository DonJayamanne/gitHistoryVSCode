import * as React from 'react';
import { Author as HeaderAuthors } from '../src/components/Header/author';
import { Author } from '../src/components/LogView/Commit/Author';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { Welcome } from '@storybook/react/demo';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('RoundedButton')} />);

storiesOf('RoundedButton', module)
    .add('with text', () => <div>Hello Button12341234</div>, { info: { inline: true } })
    .add(
        'Header Authors (dropdown)',
        () => <HeaderAuthors isLoading={false} settings={{}} lineHistory={false} selectAuthor={action('author')} />,
        {
            info: { inline: true },
        },
    )
    .add(
        'Author',
        () => (
            <Author
                selectAuthor={action('select author')}
                locale="en"
                result={{ date: new Date(), email: 'email@email.email', name: 'Author Name' }}
            ></Author>
        ),
        {
            info: { inline: true },
        },
    )
    .add(
        'with some emoji',
        () => (
            <div>
                <span role="img" aria-label="so cool">
                    😀 😎 👍 💯
                </span>
            </div>
        ),
        { info: { inline: true } },
    );
