<script>
  import 'carbon-components-svelte/css/white.css'
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
    Tag,
  } from 'carbon-components-svelte'

  let isSideNavOpen = false
</script>

<Header persistentHamburgerMenu={true} platformName="DLC-LN" bind:isSideNavOpen>
  <Tag type="cyan"> Testnet </Tag>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    <HeaderNavItem href="#/" text="DLC" />
    <HeaderNavItem href="#/event" text="Event" />
    <HeaderNavItem href="#/position" text="Position" />
	<HeaderNavItem href="#/faq" text="FAQ" />
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    <HeaderNavItem href="#/" text="DLC" />
    <HeaderNavItem href="#/event" text="Event" />
    <HeaderNavItem href="#/position" text="Position" />
	<HeaderNavItem href="#/faq" text="FAQ" />
  </SideNavItems>
</SideNav>
<Content>
  <Grid>
    <Row>
      <Column />
    </Row>
  </Grid>
</Content>
